const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());
const dummyProducts = require('../src/data/products.json');

async function run() {
  console.log("Connecting to database...");
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const dummyIds = dummyProducts.map(p => p.id);
  console.log(`Found ${dummyIds.length} dummy products to remove.`);

  if (dummyIds.length === 0) {
    console.log("No dummy products found to delete.");
    return;
  }

  // Delete in chunks to avoid SQL max placeholders error
  const chunkSize = 50;
  let totalDeleted = 0;

  for (let i = 0; i < dummyIds.length; i += chunkSize) {
    const chunk = dummyIds.slice(i, i + chunkSize);
    const placeholders = chunk.map(() => '?').join(',');
    
    const [result] = await db.execute(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      chunk
    );
    totalDeleted += result.affectedRows;
  }

  console.log(`\nSuccessfully removed ${totalDeleted} dummy products from your database!`);
  await db.end();
}

run().catch(console.error);
