const { createConnection } = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

async function run() {
  console.log("Connecting to database...");
  const db = await createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  console.log("Deleting all products...");
  const [result] = await db.execute("DELETE FROM products");
  
  console.log(`\nSuccessfully removed ${result.affectedRows} products from your database!`);
  await db.end();
}

run().catch(console.error);
