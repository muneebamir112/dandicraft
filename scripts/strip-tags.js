const mysql = require('mysql2/promise');
require('@next/env').loadEnvConfig(process.cwd());

function stripHtml(html) {
  if (!html) return '';
  // Decode common entities just in case
  let text = html.replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&quot;/g, '"')
                 .replace(/&#039;/g, "'")
                 .replace(/&amp;/g, '&');
  // Strip tags
  return text.replace(/<[^>]+>/g, '').trim();
}

async function run() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
  
  const [products] = await db.execute('SELECT id, description FROM products');
  let updatedCount = 0;
  for (const p of products) {
    const stripped = stripHtml(p.description);
    if (stripped !== p.description) {
      await db.execute('UPDATE products SET description = ? WHERE id = ?', [stripped, p.id]);
      updatedCount++;
    }
  }
  
  console.log('Stripped HTML tags from', updatedCount, 'product descriptions.');
  await db.end();
}
run();
