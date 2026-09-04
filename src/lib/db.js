import "server-only";
import mysql from "mysql2/promise";

const globalForDb = globalThis;

function createPool() {
  return mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "dandicraft",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: "utf8mb4",
    decimalNumbers: true,
    ssl: process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "127.0.0.1" && process.env.MYSQL_HOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
  });
}

export const db = globalForDb.__dandicraftDbPoolV2 || createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dandicraftDbPoolV2 = db;
}
