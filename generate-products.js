const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const directories = [
  "Custom - Dandicraft",
  "Paint and Supplies - Dandicraft",
  "Paint-by-Number - Dandicraft",
  "Photo Pillows - Dandicraft",
  "Plaster Crafts - Dandicraft",
  "Stuff-a-Bear - Dandicraft",
  "Washable Paint-by-Number - Dandicraft"
];

const existingProductsFile = path.join(__dirname, 'src', 'data', 'products.json');
let existingProducts = [];
try {
  existingProducts = JSON.parse(fs.readFileSync(existingProductsFile, 'utf-8'));
} catch (e) {
  console.log("Could not read existing products");
}

let newProducts = [];
// keep existing products at the top for specific ones with addons/options
newProducts = [...existingProducts];

const addedSlugs = new Set(newProducts.map(p => p.slug));

function formatName(filename) {
  // e.g. imgi_39_Cement-Mixer-Truck.png -> Cement Mixer Truck
  let name = filename.replace(/^imgi_\d+_/, '').replace(/\.[^/.]+$/, "");
  // remove trailing sizing e.g. -300x300 or -768x768
  name = name.replace(/-\d+x\d+$/, '');
  name = name.replace(/-/g, ' ');
  return name;
}

directories.forEach(dirName => {
  const dirPath = path.join(publicDir, dirName);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    // We only want to add the main images, not the thumbnails.
    // Thumbnails have patterns like -300x300, -150x150, -10x10 etc.
    const mainImages = files.filter(f => !f.match(/-\d+x\d+\.(png|jpg|jpeg|webp)$/i) && f.startsWith('imgi_'));

    let category = dirName.replace(' - Dandicraft', '');
    if (category === "Washable Paint-by-Number") category = "Washable Paint-by-Number";
    
    mainImages.forEach(file => {
      let rawName = formatName(file);
      if (!rawName) return;
      
      let slug = rawName.toLowerCase().replace(/\s+/g, '-');
      
      // We don't want duplicates if we already have it in existing products
      if (!addedSlugs.has(slug)) {
        let price = 20.00;
        if (category === "Plaster Crafts" || category === "Plaster") price = 0; // Requires quote
        else if (category === "Paint-by-Number") price = 30.00;
        else if (category === "Stuff-a-Bear") price = 15.00;
        else if (category === "Washable Paint-by-Number") price = 12.00;
        else if (category === "Custom") price = 30.00;
        else if (category === "Photo Pillows") price = 18.00;
        else if (category === "Paint and Supplies") price = 5.00;

        let requiresQuote = (category === "Plaster Crafts" || category === "Plaster");
        
        // Use exact category map strings as in Shop.js
        let mappedCat = category;
        if (category === "Plaster Crafts") mappedCat = "Plaster";
        
        let newProd = {
          id: slug,
          slug: slug,
          name: rawName,
          category: mappedCat,
          price: price,
          description: `Premium ${rawName} kit. Perfect for your next creative project.`,
          hasUpload: category === "Custom" || category === "Photo Pillows",
          image: `/${dirName}/${file}`,
          options: [],
          addons: []
        };
        
        if (requiresQuote) {
          newProd.requiresQuote = true;
        }

        newProducts.push(newProd);
        addedSlugs.add(slug);
      }
    });
  }
});

fs.writeFileSync(existingProductsFile, JSON.stringify(newProducts, null, 2));
console.log("Generated " + newProducts.length + " products.");
