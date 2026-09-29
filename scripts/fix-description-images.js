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

  const [products] = await db.execute("SELECT id, description FROM products");
  console.log(`Checking descriptions for ${products.length} products...`);

  let updatedCount = 0;
  let downloadedCount = 0;

  for (const product of products) {
    if (!product.description) continue;
    
    let updatedDescription = product.description;
    let needsUpdate = false;

    // Regex to find src="..." containing wp-content/uploads
    const srcRegex = /src=["'](https?:\/\/[^"']*(?:dandicraft\.com|pink-dugong-468121\.hostingersite\.com)\/wp-content\/uploads\/[^"']+)["']/gi;
    
    let match;
    const urlsToDownload = [];
    
    // First, find all URLs
    while ((match = srcRegex.exec(product.description)) !== null) {
      urlsToDownload.push(match[1]);
    }

    for (const originalUrl of urlsToDownload) {
      try {
        const parsedUrl = new URL(originalUrl);
        const fileName = path.basename(parsedUrl.pathname);
        const safeName = 'desc-' + product.id + '-' + fileName;
        const destPath = path.join(uploadDir, safeName);
        
        // Force the download to pull from the old hostinger server instead of the live Next.js app
        const fetchUrl = originalUrl.replace(/https?:\/\/(www\.)?dandicraft\.com/i, 'https://pink-dugong-468121.hostingersite.com');
        
        await downloadImage(fetchUrl, destPath);
        
        const newLocalUrl = '/uploads/' + safeName;
        updatedDescription = updatedDescription.replace(originalUrl, newLocalUrl);
        needsUpdate = true;
        downloadedCount++;
        process.stdout.write('.');
      } catch (err) {
        console.error(`\nError downloading description image ${originalUrl}:`, err.message);
      }
    }

    if (needsUpdate) {
      await db.execute(
        "UPDATE products SET description = ? WHERE id = ?",
        [updatedDescription, product.id]
      );
      updatedCount++;
    }
  }

  console.log(`\nFinished! Successfully downloaded ${downloadedCount} description images and updated ${updatedCount} products.`);
  await db.end();
}

run().catch(console.error);
