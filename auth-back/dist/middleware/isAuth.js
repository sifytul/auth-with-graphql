"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const isAuth = ({ context }, next) => {
    const token = context.req.headers["authorization"];
    if (!token) {
        throw new Error("not Authenticated");
    }
    if (!token.startsWith("bearer")) {
        throw new Error("Forbidden");
    }
    let jwtToken = token.split(" ")[1];
    try {
        const payload = (0, jsonwebtoken_1.verify)(jwtToken, process.env.ACCESS_TOKEN_SECRET);
        context.payload = { userId: payload.userId, isAdmin: payload.isAdmin };
    }
    catch (err) {
        if (err.message === "jwt expired") {
            throw new Error(err.message);
        }
        throw new Error("Forbidden");
    }
    return next();
};
exports.isAuth = isAuth;
//# sourceMappingURL=isAuth.js.map