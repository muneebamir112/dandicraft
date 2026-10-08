const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const mysql = require("mysql2/promise");
const { loadEnvConfig } = require("@next/env");
const csv = require("csv-parser"); // You need to run: npm install csv-parser

loadEnvConfig(process.cwd());

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      resolve(); // Already downloaded
      return;
    }
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      } else {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

const database = process.env.MYSQL_DATABASE || "dandicraft";

// Helper to generate a slug from the product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function main() {
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

  const importFolder = path.join(process.cwd(), "csv-imports");

  if (!fs.existsSync(importFolder)) {
    fs.mkdirSync(importFolder);
    console.log("Created 'csv-imports' folder. Please place your CSV files there and run this script again.");
    process.exit(0);
  }

  const files = fs.readdirSync(importFolder).filter((f) => f.endsWith(".csv"));

  if (files.length === 0) {
    console.log("No CSV files found in 'csv-imports' folder.");
    process.exit(0);
  }

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(importFolder, file);
    const results = [];

    // Parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`Found ${results.length} products in ${file}. Importing to database...`);

    for (const row of results) {
      // Handle the case where the Name is empty (sometimes happens in exports for variations)
      const name = row["Name"] || "Unnamed Product";
      if (!row["Name"]) continue;

      const slug = generateSlug(name);
      const id = slug; // Using slug as ID as per the schema

      // Parse price (use Sale price if exists, otherwise Regular price)
      const salePrice = parseFloat(row["Sale price"]);
      const regularPrice = parseFloat(row["Regular price"]);
      let price = salePrice || regularPrice || 0;
      if (isNaN(price)) price = 0;

      // Handle categories (WooCommerce categories look like "Category > Subcategory")
      const rawCategories = row["Categories"] || "";
      const categoryList = rawCategories.split(",").map(c => c.trim()).filter(Boolean);
      const mainCategory = categoryList.length > 0 ? categoryList[0] : "Uncategorized";

      // Description
      const description = row["Description"] || row["Short description"] || "";

      // Images (comma separated URLs)
      const rawImages = row["Images"] || "";
      const imageUrls = rawImages.split(",").map(url => url.trim()).filter(Boolean);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localImageUrls = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        if (url.startsWith('http')) {
          try {
            const fileName = path.basename(new URL(url).pathname);
            const safeName = slug + '-' + i + '-' + fileName;
            const destPath = path.join(uploadDir, safeName);
            await downloadImage(url, destPath);
            localImageUrls.push('/uploads/' + safeName);
          } catch (e) {
            console.error(`Error downloading image ${url}:`, e.message);
            localImageUrls.push(url); // fallback
          }
        } else {
          localImageUrls.push(url);
        }
      }

      const mainImage = localImageUrls.length > 0 ? localImageUrls[0] : "";
      
      // Stock
      const stockQuantity = parseInt(row["Stock"]) || 0;
      const trackInventory = row["Manage stock?"] === "1" || row["Manage stock?"] === "yes";

      // Featured
      const isFeatured = row["Is featured?"] === "1" || row["Is featured?"] === "yes";

      try {
        await connection.execute(
          `INSERT INTO products
            (id, slug, name, category, price, description, has_upload, requires_quote,
             min_qty, track_inventory, stock_quantity, image, images_json, options_json, addons_json, featured, active)
           VALUES (?, ?, ?, ?, ?, ?, FALSE, FALSE, 1, ?, ?, ?, ?, '[]', '[]', ?, TRUE)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             category = VALUES(category),
             price = VALUES(price),
             description = VALUES(description),
             track_inventory = VALUES(track_inventory),
             stock_quantity = VALUES(stock_quantity),
             image = VALUES(image),
             images_json = VALUES(images_json),
             featured = VALUES(featured),
             active = TRUE`,
          [
            id,
            slug,
            name,
            mainCategory,
            price,
            description,
            trackInventory,
            stockQuantity,
            mainImage,
            JSON.stringify(localImageUrls),
            isFeatured
          ]
        );
      } catch (err) {
        console.error(`Error inserting product ${name}:`, err.message);
      }
    }
    
    console.log(`Finished importing ${file}.`);
  }

  await connection.end();
  console.log("All imports completed successfully!");
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});
