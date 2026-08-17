require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  // Get all published products except the 3 that already have correct second images
  const excludeProducts = [
    'Soy Wax Melts | Strong Long-Lasting Fragrance',
    'Engraved Birth Month Flower Keychain',
    'Soy Wax Melts | 1 oz Cube'
  ];
  
  const products = await db.collection('products').find({
    status: 'published',
    name: { $nin: excludeProducts }
  }).toArray();

  console.log(`Found ${products.length} products to update\n`);

  for (const product of products) {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0].url;
      
      // Replace -1 with -2 for second image
      const secondImage = firstImage.replace('-1.png', '-2.png');
      
      // Only update if the second image is different
      if (secondImage !== firstImage) {
        const result = await db.collection('products').updateOne(
          { _id: product._id },
          { 
            $set: { 
              'images.1': {
                url: secondImage,
                alt: product.images[0].alt || product.name
              }
            } 
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log('✓ Updated:', product.name);
          console.log('  First image:', firstImage);
          console.log('  Second image:', secondImage);
          console.log('');
        }
      } else {
        console.log('⊘ Skipped (no -1 pattern):', product.name);
        console.log('  Image:', firstImage);
        console.log('');
      }
    }
  }

  console.log('✓ Done adding second images');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
