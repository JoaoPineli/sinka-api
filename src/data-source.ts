import "reflect-metadata"
import { DataSource } from "typeorm"
import 'dotenv/config'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [process.env.NODE_ENV === "production" ? "dist/entity/**/*.js" : "src/entity/**/*.{js,ts}"],
    migrations: [process.env.NODE_ENV === "production" ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
    subscribers: [],
})