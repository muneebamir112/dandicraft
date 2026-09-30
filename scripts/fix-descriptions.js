const mysql = require("mysql2/promise");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "dandicraft",
    ssl: process.env.MYSQL_HOST && process.env.MYSQL_HOST !== "127.0.0.1" && process.env.MYSQL_HOST !== "localhost"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  try {
    const [products] = await connection.query("SELECT id, description FROM products");
    let updatedCount = 0;

    for (const product of products) {
      if (!product.description) continue;
      
      let newDescription = product.description;
      let changed = false;

      // Replace literal '\n' sequences with standard newlines or <br/>
      if (newDescription.includes('\\n')) {
        newDescription = newDescription.replace(/\\n/g, '\n');
        changed = true;
      }

      // Remove the specific broken image from the description
      const brokenImgStr = '<img class="alignnone size-medium wp-image-1972" src="https://dandicraft.com/wp-content/uploads/2025/11/freepik_br_7e5b9e80-2e7c-4571-9c3f-f28bd319dd9d-300x120.png" alt="" width="300" height="120">';
      if (newDescription.includes(brokenImgStr)) {
        newDescription = newDescription.replace(brokenImgStr, '');
        changed = true;
      }
      
      // Also catch similar broken images from wp-content
      if (newDescription.includes('dandicraft.com/wp-content/uploads')) {
         newDescription = newDescription.replace(/<img[^>]*dandicraft\.com\/wp-content\/uploads[^>]*>/g, '');
         changed = true;
      }

      if (changed) {
        await connection.execute("UPDATE products SET description = ? WHERE id = ?", [newDescription.trim(), product.id]);
        updatedCount++;
        console.log(`Updated product ${product.id}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} products.`);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
