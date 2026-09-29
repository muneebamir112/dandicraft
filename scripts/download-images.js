const fs = require('fs');
const path = require('path');
const https = require('https');
const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

async function run() {
  console.log("Connecting to database...");
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [products] = await db.execute("SELECT id, name, image, images_json FROM products");
  console.log(`Found ${products.length} products to check.`);

  let updatedCount = 0;
  let downloadedCount = 0;

  for (const product of products) {
    let needsUpdate = false;
    let newImage = product.image;
    let newImagesList = [];
    
    try {
      newImagesList = JSON.parse(product.images_json || '[]');
    } catch (e) {
      newImagesList = [];
    }

    // Process primary image
    if (newImage && newImage.includes('pink-dugong')) {
      const fileName = path.basename(new URL(newImage).pathname);
      const safeName = product.id + '-' + fileName;
      const destPath = path.join(uploadDir, safeName);
      try {
        await downloadImage(newImage, destPath);
        newImage = '/uploads/' + safeName;
        needsUpdate = true;
        downloadedCount++;
        process.stdout.write('.');
      } catch (err) {
        console.error(`\nError downloading ${newImage}:`, err.message);
      }
    }

    // Process gallery images
    for (let i = 0; i < newImagesList.length; i++) {
      if (newImagesList[i].includes('pink-dugong')) {
        const fileName = path.basename(new URL(newImagesList[i]).pathname);
        const safeName = product.id + '-' + i + '-' + fileName;
        const destPath = path.join(uploadDir, safeName);
        try {
          await downloadImage(newImagesList[i], destPath);
          newImagesList[i] = '/uploads/' + safeName;
          needsUpdate = true;
          downloadedCount++;
          process.stdout.write('.');
        } catch (err) {
          console.error(`\nError downloading ${newImagesList[i]}:`, err.message);
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

  console.log(`\nFinished! Successfully downloaded ${downloadedCount} images and updated ${updatedCount} products.`);
  await db.end();
}

run().catch(console.error);
