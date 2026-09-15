const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");
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
    multipleStatements: true,
    ssl: process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "127.0.0.1" && process.env.MYSQL_HOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${database}\``);

    const schema = fs.readFileSync(path.join(process.cwd(), "database", "schema.sql"), "utf8");
    await connection.query(schema);

    const [imageColumns] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = 'products' AND column_name = 'images_json'`
    );
    if (!imageColumns[0].count) {
      await connection.query(`ALTER TABLE products ADD COLUMN images_json JSON NOT NULL AFTER image`);
      await connection.query(`UPDATE products SET images_json = JSON_ARRAY(image) WHERE image <> ''`);
      await connection.query(`UPDATE products SET images_json = JSON_ARRAY() WHERE image = ''`);
    }

    const [inventoryColumns] = await connection.query(
      `SELECT column_name AS columnName
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'products'
         AND column_name IN ('track_inventory', 'stock_quantity')`
    );
    const inventoryColumnNames = new Set(inventoryColumns.map((column) => column.columnName));
    if (!inventoryColumnNames.has("track_inventory")) {
      await connection.query(
        `ALTER TABLE products ADD COLUMN track_inventory BOOLEAN NOT NULL DEFAULT FALSE AFTER min_qty`
      );
    }
    if (!inventoryColumnNames.has("stock_quantity")) {
      await connection.query(
        `ALTER TABLE products ADD COLUMN stock_quantity INT UNSIGNED NOT NULL DEFAULT 0 AFTER track_inventory`
      );
    }

    const products = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "src", "data", "products.json"), "utf8")
    );
    const featuredIds = new Set([
      "custom-paint-by-number",
      "stuff-a-bear-large",
      "photo-pillows-custom",
      "candleart-libbey-4-5",
    ]);

    for (const product of products) {
      await connection.execute(
        `INSERT IGNORE INTO products
          (id, slug, name, category, price, description, has_upload, requires_quote,
           min_qty, image, images_json, options_json, addons_json, featured, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          product.id,
          product.slug,
          product.name,
          product.category,
          Number(product.price || 0),
          product.description || "",
          Boolean(product.hasUpload),
          Boolean(product.requiresQuote),
          Math.max(1, Number(product.minQty || 1)),
          product.image || "",
          JSON.stringify(product.images || (product.image ? [product.image] : [])),
          JSON.stringify(product.options || []),
          JSON.stringify(product.addons || []),
          featuredIds.has(product.id),
        ]
      );
    }

    const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");
    const adminName = String(process.env.ADMIN_NAME || "Dandicraft Admin").trim();

    if (adminEmail && adminPassword) {
      if (adminPassword.length < 12) {
        throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
      }
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await connection.execute(
        `INSERT INTO admin_users (name, email, password_hash)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
        [adminName, adminEmail, passwordHash]
      );
      console.log(`Admin account ready: ${adminEmail}`);
    } else {
      console.warn("ADMIN_EMAIL/ADMIN_PASSWORD were not set, so no admin account was created.");
    }

    console.log(`Database '${database}' is ready with ${products.length} catalog products.`);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exitCode = 1;
});
