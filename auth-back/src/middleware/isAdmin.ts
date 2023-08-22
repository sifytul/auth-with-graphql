import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/myContext";

export const isAdmin: MiddlewareFn<MyContext> = ({ context }, next) => {
  const isAdmin = context.payload?.isAdmin;

  if (!isAdmin) {
    throw new Error("Not authorized. Admin only");
  }
  return next();
};
