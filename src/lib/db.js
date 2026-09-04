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
  });
}

export const db = globalForDb.__dandicraftDbPool || createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dandicraftDbPool = db;
}
