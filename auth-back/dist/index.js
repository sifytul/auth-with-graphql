"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = require("jsonwebtoken");
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const user_1 = require("./Resolver/user");
const data_source_1 = require("./data-source");
const user_2 = require("./entities/user");
const sendRefreshToken_1 = require("./utils/sendRefreshToken");
const tokenCreator_1 = require("./utils/tokenCreator");
async function main() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    let retries = 5;
    while (retries) {
        try {
            await data_source_1.AppDataSource.initialize();
            break;
        }
        catch (err) {
            console.error(err);
            retries -= 1;
        }
    }
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.get("/health", (_req, res) => {
        return res.status(200).json({ success: true, message: "Server is Up" });
    });
    app.post("/refresh_token", async (req, res) => {
        const cookie = req.cookies;
        if (!cookie) {
            return res.status(401).json({ ok: false, accessToken: "" });
        }
        let verified;
        try {
            verified = (0, jsonwebtoken_1.verify)(cookie.jid, process.env.REFRESH_TOKEN_SECRET);
            if (!verified) {
                return res.status(401).json({ ok: false, accessToken: "" });
            }
        }
        catch (err) {
            return res.status(401).json({ ok: false, accessToken: "" });
        }
        const isUserExisted = await user_2.User.findOne({
            where: { id: verified.userId },
        });
        if (!isUserExisted) {
            return res.status(401).json({ ok: false, accessToken: "" });
        }
        (0, sendRefreshToken_1.sendRefreshToken)(res, {
            userId: isUserExisted.id,
            isAdmin: isUserExisted.isAdmin,
        });
        return res.status(200).json({
            ok: true,
            accessToken: (0, tokenCreator_1.createAccessToken)({
                userId: isUserExisted.id,
                isAdmin: isUserExisted.isAdmin,
            }),
        });
    });
    const server = new server_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({ resolvers: [user_1.UserResolver] }),
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    app.use(body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async (context) => ({
            req: context.req,
            res: context.res,
        }),
    }));
    app.listen(4000, () => {
        console.log(`Server is listening on http://localhost:4000/graphql`);
    });
}
main().catch((err) => {
    console.log(`Something broke => ${err}`);
});
//# sourceMappingURL=index.js.map