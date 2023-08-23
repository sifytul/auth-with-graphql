import { compare, hash } from "bcryptjs";
import { JwtPayload, decode, sign, verify } from "jsonwebtoken";
import {
  Arg,
  Ctx,
  Mutation,
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
import { createAccessToken } from "../utils/tokenCreator";
import { UserResponse } from "./types/UserRsponseType";

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return "hello world";
  }

  @Mutation(() => Boolean)
  async revokeRefreshTokenForUser(
    @Arg("email") email: string,
    @Ctx() {}: MyContext
  ): Promise<boolean> {
    AppDataSource.getRepository(User).increment({ email }, "tokenVersion", 1);
    return true;
  }

  @Mutation(() => UserResponse)
  async createUser(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Arg("name") name: string,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
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
    const tokenPayload = {
      userId: createdUser.id,
      isAdmin: createdUser.isAdmin,
      tokenVersion: createdUser.tokenVersion,
    };
    sendRefreshToken(res, tokenPayload);

    return {
      data: {
        user: createdUser,
        accessToken: createAccessToken(tokenPayload),
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
    await AppDataSource.getRepository(User).increment(
      { email },
      "tokenVersion",
      1
    );
    let tokenPayload = {
      userId: isUserExist.id,
      isAdmin: isUserExist.isAdmin,
      tokenVersion: isUserExist.tokenVersion + 1,
    };
    sendRefreshToken(res, tokenPayload);
    return {
      data: {
        user: isUserExist,
        accessToken: createAccessToken(tokenPayload),
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
      await sendMail(email, forgotPasswordToken);
    } catch (err) {
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
    let tokenPayload = {
      userId: updatedUserField.id,
      isAdmin: updatedUserField.isAdmin,
      tokenVersion: updatedUserField.tokenVersion,
    };
    sendRefreshToken(res, tokenPayload);
    return {
      data: {
        user: updatedUserField,
        accessToken: createAccessToken(tokenPayload),
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
