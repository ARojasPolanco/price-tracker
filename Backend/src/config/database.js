import "dotenv/config";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});
