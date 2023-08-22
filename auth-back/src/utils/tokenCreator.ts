import jwt from "jsonwebtoken";

export const createRefreshToken = (payload: any) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "3d",
  });
};

export const createAccessToken = (payload: any) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};
