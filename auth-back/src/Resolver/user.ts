import { compare, hash } from "bcryptjs";
import { JwtPayload, decode, sign, verify } from "jsonwebtoken";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user";
import { isAdmin } from "../middleware/isAdmin";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/myContext";
import { sendMail } from "../utils/sendEmail";
import { sendRefreshToken } from "../utils/sendRefreshToken";
import { createAccessToken, createRefreshToken } from "../utils/tokenCreator";

@ObjectType()
class meResponse {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
class UserResponse {
  @Field(() => meResponse, { nullable: true })
  data?: meResponse;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class SuccessResponse {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String)
  accessToken: string;
}

@ObjectType()
class CreateUserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => SuccessResponse, { nullable: true })
  success?: SuccessResponse;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hello world";
  }

  @Mutation(() => CreateUserResponse)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("name") name: string,
    @Ctx() { res }: MyContext
  ) {
    if (!email || !password) {
      return {
        errors: [
          {
            field: "validation Error",
            message: "Field can't be empty",
          },
        ],
      };
    }

    let createdUser;
    try {
      let isEmailAlreadyTaken = await User.findOne({ where: { email } });
      if (isEmailAlreadyTaken) {
        return {
          errors: [
            {
              field: "Email",
              message: "Email already taken",
            },
          ],
        };
      }
      let hashedPassword = await hash(password, 12);
      createdUser = await User.create({
        name,
        email,
        password: hashedPassword,
      }).save();
    } catch (err) {
      return {
        errors: [
          {
            field: "DB",
            message: "Failed to create User ->" + err.message,
          },
        ],
      };
    }
    res.cookie(
      "jid",
      createRefreshToken({
        userId: createdUser.id,
        isAdmin: createdUser.isAdmin,
      }),
      {
        httpOnly: true,
        maxAge: 1024 * 60 * 60 * 24 * 3,
        secure: false,
      }
    );
    return {
      success: {
        ok: true,
        accessToken: createAccessToken({
          userId: createdUser.id,
          isAdmin: createdUser.isAdmin,
        }),
      },
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext
  ) {
    if (!email || !password) {
      return {
        errors: [
          {
            field: "validation Error",
            message: "Field can't be empty",
          },
        ],
      };
    }

    let isUserExist = await User.findOne({ where: { email } });
    if (!isUserExist) {
      return {
        errors: [
          {
            field: "email",
            message: "User not exist, try sign up",
          },
        ],
      };
    }

    let isPasswordVerified = await compare(password, isUserExist.password);
    if (!isPasswordVerified) {
      return {
        errors: [
          {
            field: "password",
            message: "wrong password",
          },
        ],
      };
    }
    sendRefreshToken(res, {
      userId: isUserExist.id,
      isAdmin: isUserExist.isAdmin,
    });
    return {
      data: {
        user: isUserExist,
        accessToken: createAccessToken({
          userId: isUserExist.id,
          isAdmin: isUserExist.isAdmin,
        }),
      },
    };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext) {
    sendRefreshToken(res, "");
    return true;
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string) {
    if (!email) {
      return new Error("Field can't be empty");
    }
    const isUserExist = await User.findOne({
      where: {
        email,
      },
    });
    if (!isUserExist) {
      throw new Error("Wrong credentials");
    }
    let forgotPasswordToken = sign(
      { email },
      process.env.FORGET_PASSWORD_SECRET!,
      {
        expiresIn: "15m",
      }
    );
    try {
      const info = await sendMail(email, forgotPasswordToken);
      console.log("info => ", info);
    } catch (err) {
      console.log("nodemailer error => ", err);
      throw new Error(err.message);
    }
    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("password") password: string,
    @Arg("token") token: string,
    @Ctx() { res }: MyContext
  ) {
    if (!password || !token) {
      throw new Error("Invalid input");
    }

    const payload = verify(
      token,
      process.env.FORGOT_PASSWORD_SECRET!
    ) as JwtPayload;
    const newPassword = await hash(password, 12);
    let updatedUser = await AppDataSource.createQueryBuilder()
      .update(User)
      .set({
        password: newPassword,
      })
      .where("email = :email", { email: payload.email })
      .returning("*")
      .execute();
    let updatedUserField = updatedUser.raw[0];
    sendRefreshToken(res, {
      userId: updatedUserField.id,
      isAdmin: updatedUserField.isAdmin,
    });
    return {
      data: {
        user: updatedUserField,
        accessToken: createAccessToken({
          userId: updatedUserField.id,
          isAdmin: updatedUserField.isAdmin,
        }),
      },
    };
  }

  @Query(() => [User])
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdmin)
  async getAllUsers() {
    return User.find();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    const token = req.headers["authorization"];
    if (!token) {
      return null;
    }

    const payload = decode(token) as JwtPayload;

    const user = await User.findOne({ where: { id: payload.userId } });
    if (!user) {
      throw new Error("Not authorized");
    }
    return user;
  }
}
