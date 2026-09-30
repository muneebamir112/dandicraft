const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

async function run() {
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await db.query('SELECT id, name, price, requires_quote, category FROM products WHERE price = 0 AND requires_quote = FALSE');
  
  console.log(`Found ${rows.length} products with price 0 and requires_quote false:`);
  console.table(rows);
  
  await db.end();
}

run().catch(console.error);
