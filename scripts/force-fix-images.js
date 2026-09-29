const path = require('path');
const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

async function run() {
  console.log("Connecting to database for forceful image scrub...");
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [products] = await db.execute("SELECT id, name, image, images_json FROM products WHERE image LIKE '%pink-dugong%' OR images_json LIKE '%pink-dugong%'");
  console.log(`Found ${products.length} products that STILL have the old pink-dugong links.`);

  let updatedCount = 0;

  for (const product of products) {
    let needsUpdate = false;
    let newImage = product.image;
    let newImagesList = [];
    
    try {
      newImagesList = JSON.parse(product.images_json || '[]');
    } catch (e) {
      newImagesList = [];
    }

    if (newImage && newImage.includes('pink-dugong')) {
      try {
        const fileName = path.basename(new URL(newImage.trim()).pathname);
        const safeName = product.id + '-' + fileName;
        newImage = '/uploads/' + safeName;
        needsUpdate = true;
      } catch (err) {
        console.error(`Failed to parse URL for ${product.id}: ${newImage}`);
      }
    }

    for (let i = 0; i < newImagesList.length; i++) {
      if (newImagesList[i] && newImagesList[i].includes('pink-dugong')) {
        try {
          const fileName = path.basename(new URL(newImagesList[i].trim()).pathname);
          const safeName = product.id + '-' + i + '-' + fileName;
          newImagesList[i] = '/uploads/' + safeName;
          needsUpdate = true;
        } catch (err) {
           console.error(`Failed to parse gallery URL for ${product.id}`);
        }
      }
    }

    if (needsUpdate) {
      await db.execute(
        "UPDATE products SET image = ?, images_json = ? WHERE id = ?",
        [newImage, JSON.stringify(newImagesList), product.id]
      );
      updatedCount++;
    }
  }

  console.log(`\nForce-scrub complete! Fixed paths for ${updatedCount} products.`);
  await db.end();
}

run().catch(console.error);
