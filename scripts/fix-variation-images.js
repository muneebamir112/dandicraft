const mysql = require("mysql2/promise");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const database = process.env.MYSQL_DATABASE || "dandicraft";

async function fixImages() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: database,
    ssl:
      process.env.MYSQL_HOST &&
      process.env.MYSQL_HOST !== "127.0.0.1" &&
      process.env.MYSQL_HOST !== "localhost"
        ? { rejectUnauthorized: false }
        : undefined,
  });

  console.log("Checking for products with missing images...");

  // Get all products
  const [products] = await connection.query("SELECT id, name, image FROM products");
  
  let updatedCount = 0;
  
  for (const product of products) {
    if (!product.image || product.image === "") {
      // It's likely a variation, so we check if it has a ' - ' in the name
      if (product.name.includes(" - ")) {
        // Find the parent name
        const parentName = product.name.split(" - ")[0];
        
        // Find parent product in the list that has an image
        const parentProduct = products.find(p => p.name === parentName && p.image !== "");
        
        if (parentProduct) {
          console.log(`Fixing image for: ${product.name}`);
          await connection.execute("UPDATE products SET image = ? WHERE id = ?", [parentProduct.image, product.id]);
          updatedCount++;
        }
      }
    }
  }

  console.log(`Finished fixing images. Updated ${updatedCount} products.`);
  await connection.end();
}

fixImages().catch((error) => {
  console.error("Failed to fix images:", error.message);
  process.exitCode = 1;
});
