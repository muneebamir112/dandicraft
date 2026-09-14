const fs = require('fs');

let products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
const pbnScraped = JSON.parse(fs.readFileSync('scraped-pbn.json', 'utf8'));

const files = fs.readdirSync('public/Paint-by-Number - Dandicraft');
const mainImages = files
  .filter(f => !f.match(/-\d+x\d+\.(png|jpg|jpeg|webp)$/i) && f.startsWith('imgi_'))
  .filter(f => !f.toLowerCase().includes('logo') && !f.includes('remove') && !f.includes('flower-WHITE') && !f.includes('shutterstock') && !f.includes('default'));

// Sort images by the number in imgi_X_...
mainImages.sort((a, b) => {
  const numA = parseInt(a.match(/^imgi_(\d+)_/)[1]);
  const numB = parseInt(b.match(/^imgi_(\d+)_/)[1]);
  return numA - numB;
});

// Remove old PBN products (keep the first one "acrylic-paint-by-number" as a base maybe? Or just remove the badly named ones)
products = products.filter(p => p.category !== 'Paint-by-Number' || p.id === 'acrylic-paint-by-number');

// Generate the proper products
for (let i = 0; i < Math.min(pbnScraped.length, mainImages.length); i++) {
  const title = pbnScraped[i];
  const image = mainImages[i];
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // If we already have it, skip or overwrite
  if (!products.find(p => p.id === slug)) {
    products.push({
      id: slug,
      slug: slug,
      name: title,
      category: 'Paint-by-Number',
      price: 30.00,
      description: `Premium ${title} kit. Perfect for your next creative project.`,
      hasUpload: false,
      image: `/Paint-by-Number - Dandicraft/${image}`,
      options: [],
      addons: []
    });
  }
}

fs.writeFileSync('./src/data/products.json', JSON.stringify(products, null, 2));
console.log('Successfully mapped ' + Math.min(pbnScraped.length, mainImages.length) + ' PBN products');
