const mysql = require("mysql2/promise");

async function checkProducts() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  
  try {
    const [rows] = await connection.query(
      `SELECT id, name, active, track_inventory, stock_quantity, min_qty, created_at 
       FROM products 
       ORDER BY created_at DESC LIMIT 5`
    );
    console.table(rows);
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

checkProducts();

