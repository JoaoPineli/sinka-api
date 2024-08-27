import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "aws-0-sa-east-1.pooler.supabase.com",
    port: 6543,
    username: "postgres.wgjlxpwlixfjvuwmpihr",
    password: "$p$spiZ$uq9zesU4",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [process.env.NODE_ENV === "production" ? "dist/entity/**/*.js" : "src/entity/**/*.{js,ts}"],
    migrations: [process.env.NODE_ENV === "production" ? "dist/migration/**/*.js" : "src/migration/**/*.ts"],
    subscribers: [],
})