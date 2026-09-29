const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

async function run() {
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await db.execute("SELECT id, name, image FROM products WHERE name LIKE '%Bulldog%'");
  console.log("Database results for Bulldog:");
  console.table(rows);
  
  await db.end();
}

run().catch(console.error);
