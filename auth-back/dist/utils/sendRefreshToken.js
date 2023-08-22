"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendRefreshToken = void 0;
const tokenCreator_1 = require("./tokenCreator");
const sendRefreshToken = (res, payload) => {
    if (typeof payload === "string") {
        res.cookie("jid", "", {
            httpOnly: true,
            maxAge: 0,
            secure: false,
        });
    }
    else {
        res.cookie("jid", (0, tokenCreator_1.createRefreshToken)(payload), {
            httpOnly: true,
            maxAge: 1024 * 60 * 60 * 24 * 3,
            secure: false,
        });
    }
};
exports.sendRefreshToken = sendRefreshToken;
//# sourceMappingURL=sendRefreshToken.js.map