"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("./entities/user");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.POSTGRES_DB_URI,
    synchronize: true,
    logging: true,
    entities: [user_1.User],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map