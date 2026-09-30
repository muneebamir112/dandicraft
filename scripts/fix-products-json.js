const fs = require('fs');
const path = require('path');

const productsFile = path.join(process.cwd(), 'src', 'data', 'products.json');
let rawData = fs.readFileSync(productsFile, 'utf8');
const products = JSON.parse(rawData);

let updatedCount = 0;

for (const product of products) {
  if (!product.description) continue;
  
  let newDesc = product.description;
  let changed = false;
  
  if (newDesc.includes('\\n')) {
    newDesc = newDesc.replace(/\\n/g, '\n');
    changed = true;
  }
  
  const brokenImgStr = '<img class="alignnone size-medium wp-image-1972" src="https://dandicraft.com/wp-content/uploads/2025/11/freepik_br_7e5b9e80-2e7c-4571-9c3f-f28bd319dd9d-300x120.png" alt="" width="300" height="120">';
  if (newDesc.includes(brokenImgStr)) {
    newDesc = newDesc.replace(brokenImgStr, '');
    changed = true;
  }
  
  if (newDesc.includes('dandicraft.com/wp-content/uploads')) {
     newDesc = newDesc.replace(/<img[^>]*dandicraft\.com\/wp-content\/uploads[^>]*>/g, '');
     changed = true;
  }
  
  if (changed) {
    product.description = newDesc.trim();
    updatedCount++;
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
  console.log(`Updated ${updatedCount} products in products.json`);
} else {
  console.log('No updates needed in products.json');
}
