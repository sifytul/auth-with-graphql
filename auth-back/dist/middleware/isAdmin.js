"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const isAdmin = ({ context }, next) => {
    var _a;
    const isAdmin = (_a = context.payload) === null || _a === void 0 ? void 0 : _a.isAdmin;
    if (!isAdmin) {
        throw new Error("Not authorized. Admin only");
    }
    return next();
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=isAdmin.js.map