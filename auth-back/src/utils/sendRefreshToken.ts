import { Response } from "express";
import { createRefreshToken } from "./tokenCreator";

export const sendRefreshToken = (
  res: Response,
  payload: { userId: number; isAdmin: boolean } | string
) => {
  if (typeof payload === "string") {
    res.cookie("jid", "", {
      httpOnly: true,
      maxAge: 0,
      secure: false,
    });
  } else {
    res.cookie("jid", createRefreshToken(payload), {
      httpOnly: true,
      maxAge: 1024 * 60 * 60 * 24 * 3,
      secure: false,
    });
  }
};
