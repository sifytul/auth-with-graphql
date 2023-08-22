"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const bcryptjs_1 = require("bcryptjs");
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const type_graphql_1 = require("type-graphql");
const user_1 = require("../entities/user");
const isAdmin_1 = require("../middleware/isAdmin");
const isAuth_1 = require("../middleware/isAuth");
const sendRefreshToken_1 = require("../utils/sendRefreshToken");
const tokenCreator_1 = require("../utils/tokenCreator");
let meResponse = class meResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], meResponse.prototype, "accessToken", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => user_1.User),
    __metadata("design:type", user_1.User)
], meResponse.prototype, "user", void 0);
meResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], meResponse);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => meResponse, { nullable: true }),
    __metadata("design:type", meResponse)
], UserResponse.prototype, "data", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let SuccessResponse = class SuccessResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], SuccessResponse.prototype, "ok", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SuccessResponse.prototype, "accessToken", void 0);
SuccessResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], SuccessResponse);
let CreateUserResponse = class CreateUserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], CreateUserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => SuccessResponse, { nullable: true }),
    __metadata("design:type", SuccessResponse)
], CreateUserResponse.prototype, "success", void 0);
CreateUserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], CreateUserResponse);
let UserResolver = class UserResolver {
    hello() {
        return "hello world";
    }
    async createUser(email, password, name, { res }) {
        if (!email || !password) {
            return {
                errors: [
                    {
                        field: "validation Error",
                        message: "Field can't be empty",
                    },
                ],
            };
        }
        let createdUser;
        try {
            let isEmailAlreadyTaken = await user_1.User.findOne({ where: { email } });
            if (isEmailAlreadyTaken) {
                return {
                    errors: [
                        {
                            field: "Email",
                            message: "Email already taken",
                        },
                    ],
                };
            }
            let hashedPassword = await (0, bcryptjs_1.hash)(password, 12);
            createdUser = await user_1.User.create({
                name,
                email,
                password: hashedPassword,
            }).save();
        }
        catch (err) {
            return {
                errors: [
                    {
                        field: "DB",
                        message: "Failed to create User ->" + err.message,
                    },
                ],
            };
        }
        res.cookie("jid", (0, tokenCreator_1.createRefreshToken)({
            userId: createdUser.id,
            isAdmin: createdUser.isAdmin,
        }), {
            httpOnly: true,
            maxAge: 1024 * 60 * 60 * 24 * 3,
            secure: false,
        });
        return {
            success: {
                ok: true,
                accessToken: (0, tokenCreator_1.createAccessToken)({
                    userId: createdUser.id,
                    isAdmin: createdUser.isAdmin,
                }),
            },
        };
    }
    async login(email, password, { res }) {
        if (!email || !password) {
            return {
                errors: [
                    {
                        field: "validation Error",
                        message: "Field can't be empty",
                    },
                ],
            };
        }
        let isUserExist = await user_1.User.findOne({ where: { email } });
        if (!isUserExist) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "User not exist, try sign up",
                    },
                ],
            };
        }
        let isPasswordVerified = await (0, bcryptjs_1.compare)(password, isUserExist.password);
        if (!isPasswordVerified) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "wrong password",
                    },
                ],
            };
        }
        (0, sendRefreshToken_1.sendRefreshToken)(res, {
            userId: isUserExist.id,
            isAdmin: isUserExist.isAdmin,
        });
        return {
            data: {
                user: isUserExist,
                accessToken: (0, tokenCreator_1.createAccessToken)({
                    userId: isUserExist.id,
                    isAdmin: isUserExist.isAdmin,
                }),
            },
        };
    }
    async logout({ res }) {
        (0, sendRefreshToken_1.sendRefreshToken)(res, "");
        return true;
    }
    async getAllUsers() {
        return user_1.User.find();
    }
    async me({ req }) {
        const token = req.headers["authorization"];
        if (!token) {
            return null;
        }
        const payload = (0, jwt_decode_1.default)(token);
        const user = await user_1.User.findOne({ where: { id: payload.userId } });
        if (!user) {
            throw new Error("Not authorized");
        }
        return user;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => CreateUserResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Arg)("name")),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("email")),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Query)(() => [user_1.User]),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    (0, type_graphql_1.UseMiddleware)(isAdmin_1.isAdmin),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getAllUsers", null);
__decorate([
    (0, type_graphql_1.Query)(() => user_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map