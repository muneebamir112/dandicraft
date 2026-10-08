const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const mysql = require("mysql2/promise");
const { loadEnvConfig } = require("@next/env");
const csv = require("csv-parser");

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

async function main() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const addonsByProduct = {};
  
  console.log("Reading CSV...");
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(process.cwd(), "csv-imports", "addon_export.csv"))
      .pipe(csv())
      .on("data", (row) => {
        const pName = row.product_name;
        if (!addonsByProduct[pName]) {
            addonsByProduct[pName] = [];
        }
        
        let localImageUrl = "";
        if (row.image_url && row.image_url.trim()) {
            const fileName = path.basename(row.image_url.split('?')[0]);
            localImageUrl = `/uploads/${fileName}`;
            row.localImageDest = path.join(uploadsDir, fileName);
        }

        addonsByProduct[pName].push({
            name: row.addon_name || "",
            price: parseFloat(row.addon_price) || 0,
            description: row.addon_description || "",
            image: localImageUrl,
            originalUrl: row.image_url
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found addons for ${Object.keys(addonsByProduct).length} distinct products.`);
  
  let downloadedCount = 0;
  let updateCount = 0;

  for (const [pName, addons] of Object.entries(addonsByProduct)) {
      // First, download any images for these addons
      for (const addon of addons) {
          if (addon.originalUrl && addon.image) {
              const destPath = path.join(uploadsDir, path.basename(addon.image));
              try {
                  await downloadImage(addon.originalUrl, destPath);
                  downloadedCount++;
              } catch(e) {
                  console.log(`Warning: Failed to download image ${addon.originalUrl}`);
              }
          }
      }

      // Format addons specifically for the database (remove temp fields)
      const formattedAddons = addons.map(a => ({
          name: a.name,
          price: a.price,
          description: a.description,
          image: a.image
      }));

      // Find the product by name and update it
      const [result] = await db.execute(
          'UPDATE products SET addons_json = ? WHERE name = ?',
          [JSON.stringify(formattedAddons), pName]
      );
      
      if (result.affectedRows > 0) {
          updateCount += result.affectedRows;
      } else {
          console.log(`Warning: Product "${pName}" not found in database.`);
      }
  }

  console.log(`\nImport complete!`);
  console.log(`Downloaded/Verified ${downloadedCount} addon images.`);
  console.log(`Updated ${updateCount} products with their new addons.`);

  await db.end();
}

main().catch(console.error);
