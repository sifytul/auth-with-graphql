import { DataSource } from "typeorm";
import { User } from "./entities/user";
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_DB_URI!,
  synchronize: true,
  logging: true,
  entities: [User],
  subscribers: [],
  migrations: [],
});
