const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

async function run() {
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log("Updating prices...");

  // Update 16" bears to $15
  const [res16] = await db.query(
    `UPDATE products SET price = 15 WHERE id LIKE '16-%' AND price = 0`
  );
  console.log(`Updated ${res16.affectedRows} 16" bear products to $15.`);

  // Update 8" bears to $10
  const [res8] = await db.query(
    `UPDATE products SET price = 10 WHERE id LIKE '8-%' AND price = 0`
  );
  console.log(`Updated ${res8.affectedRows} 8" bear products to $10.`);

  // Update Custom Diamond Art to $25 (from products.json default)
  const [resCustom] = await db.query(
    `UPDATE products SET price = 25 WHERE id = 'custom-diamond-art' AND price = 0`
  );
  if (resCustom.affectedRows > 0) {
    console.log(`Updated Custom Diamond Art to $25.`);
  }

  await db.end();
}

run().catch(console.error);
