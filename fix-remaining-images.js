require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const updates = [
    { name: 'Silicone Wristlet Keychain | Purple', image: '/images/products/Silicone-Wristlet-Keychain-1.png' },
    { name: 'Mama Car Mirror Air Freshener', image: '/images/products/Mama-Car-Mirror-Air-1.png' },
    { name: 'Silicone Keychain Charm | Bee Focal Bead', image: '/images/products/Silicone-keychain-charm-1.png' }
  ];

  for (const upd of updates) {
    const result = await db.collection('products').updateOne(
      { name: upd.name },
      { $set: { 'images.0.url': upd.image } }
    );
    if (result.matchedCount > 0) {
      console.log('✓ Updated:', upd.name);
      console.log('  New image:', upd.image);
    } else {
      console.log('✗ Not found:', upd.name);
    }
  }

  console.log('\n✓ Done updating remaining product images');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
