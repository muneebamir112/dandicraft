const mysql = require("mysql2/promise");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const database = process.env.MYSQL_DATABASE || "dandicraft";
if (!/^[a-zA-Z0-9_]+$/.test(database)) {
  throw new Error("MYSQL_DATABASE may only contain letters, numbers, and underscores.");
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database,
    ssl: process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "127.0.0.1" && process.env.MYSQL_HOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    const [columns] = await connection.query(
      `SELECT column_name AS columnName
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'products'
         AND column_name IN ('track_inventory', 'stock_quantity')`
    );
    const names = new Set(columns.map((column) => column.columnName));

    if (!names.has("track_inventory")) {
      await connection.query(
        `ALTER TABLE products ADD COLUMN track_inventory BOOLEAN NOT NULL DEFAULT FALSE AFTER min_qty`
      );
    }
    if (!names.has("stock_quantity")) {
      await connection.query(
        `ALTER TABLE products ADD COLUMN stock_quantity INT UNSIGNED NOT NULL DEFAULT 0 AFTER track_inventory`
      );
    }

    console.log("Inventory migration completed successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Inventory migration failed:", error.message);
  process.exitCode = 1;
});
