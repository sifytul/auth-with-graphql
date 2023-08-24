import { Field, ObjectType } from "type-graphql";
import { User } from "../../entities/user";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class Success {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String)
  accessToken: string;
}

@ObjectType()
export class meResponse {
  @Field(() => String, { nullable: true })
  accessToken?: string;

  @Field(() => User)
  user: User;
}

@ObjectType()
export class UserResponse {
  @Field(() => meResponse, { nullable: true })
  data?: meResponse;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class CreateUserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Success, { nullable: true })
  success?: Success;
}
