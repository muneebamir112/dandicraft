const https = require('https');
const fs = require('fs');

https.get('https://dandicraft.com/product-category/paint-by-number/?et_per_page=-1&orderby=price', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const regex = /<h2 class="woocommerce-loop-product__title[^>]*><a[^>]*>(.*?)<\/a><\/h2>/g;
    let match;
    const products = [];
    while ((match = regex.exec(data)) !== null) {
      products.push(match[1].trim());
    }
    console.log('Found', products.length, 'products');
    
    fs.writeFileSync('scraped-pbn.json', JSON.stringify(products, null, 2));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
