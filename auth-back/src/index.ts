import { ApolloServer } from "@apollo/server";
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import { JwtPayload, verify } from "jsonwebtoken";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./Resolver/user";
import { AppDataSource } from "./data-source";
import { User } from "./entities/user";
import { sendRefreshToken } from "./utils/sendRefreshToken";
import { createAccessToken } from "./utils/tokenCreator";

async function main() {
  const app = express();
  const httpServer = http.createServer(app);

  // Initialize database
  let retries = 5;
  while (retries) {
    try {
      await AppDataSource.initialize();
      break;
    } catch (err) {
      console.error(err);
      retries -= 1;
    }
  }

  // global middleware in use
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(cookieParser());

  // global routes
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: "Server is Up" });
  });

  // generate refresh Token
  app.post("/refresh_token", async (req: Request, res: Response) => {
    const cookie = req.cookies;
    if (!cookie) {
      return res.status(401).json({ ok: false, accessToken: "" });
    }
    let verified;
    try {
      verified = verify(
        cookie.jid,
        process.env.REFRESH_TOKEN_SECRET!
      ) as JwtPayload;
      if (!verified) {
        return res.status(401).json({ ok: false, accessToken: "" });
      }
    } catch (err) {
      return res.status(401).json({ ok: false, accessToken: "" });
    }
    const isUserExisted = await User.findOne({
      where: { id: verified.userId },
    });
    if (!isUserExisted) {
      return res.status(401).json({ ok: false, accessToken: "" });
    }

    if (verified.tokenVersion !== isUserExisted.tokenVersion) {
      return res.status(401).json({ ok: false, accessToken: "" });
    }
    let tokenPayload = {
      userId: isUserExisted.id,
      isAdmin: isUserExisted.isAdmin,
      tokenVersion: isUserExisted.tokenVersion,
    };
    sendRefreshToken(res, tokenPayload);

    return res.status(200).json({
      ok: true,
      accessToken: createAccessToken(tokenPayload),
    });
  });

  // Set up Apollo Server
  const server = new ApolloServer({
    schema: await buildSchema({ resolvers: [UserResolver] }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    bodyParser.json(),
    expressMiddleware(server, {
      context: async (context: ExpressContextFunctionArgument) => ({
        req: context.req,
        res: context.res,
      }),
    })
  );

  app.listen(4000, () => {
    console.log(`Server is listening on http://localhost:4000/graphql`);
  });
}

main().catch((err) => {
  console.log(`Something broke => ${err}`);
});
//
