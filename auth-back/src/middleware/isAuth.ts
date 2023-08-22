import { JwtPayload, verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types/myContext";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const token = context.req.headers["authorization"];
  if (!token) {
    throw new Error("not Authenticated");
  }
  if (!token.startsWith("bearer")) {
    throw new Error("Forbidden");
  }
  let jwtToken = token.split(" ")[1];
  try {
    const payload = verify(
      jwtToken,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    context.payload = { userId: payload.userId, isAdmin: payload.isAdmin };
  } catch (err) {
    if (err.message === "jwt expired") {
      throw new Error(err.message);
    }
    throw new Error("Forbidden");
  }
  return next();
};
