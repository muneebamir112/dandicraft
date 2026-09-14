const fs = require('fs');

const files = fs.readdirSync('public/Paint-by-Number - Dandicraft');
const mainImages = files.filter(f => !f.match(/-\d+x\d+\.(png|jpg|jpeg|webp)$/i) && f.startsWith('imgi_'));

console.log('All files:', files.length);
console.log('Main images:', mainImages.length);

const products = mainImages.map(f => {
  let name = f.replace(/^imgi_\d+_/, '').replace(/\.[^/.]+$/, "");
  return name.replace(/-/g, ' ');
});

console.log('Unique products:', new Set(products).size);
