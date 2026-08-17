require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const updates = [
    { name: 'Butterfly Car Vent Clip Freshie', image: '/images/products/Butterfly-Car-Vent-Clip-Freshie-1.png' },
    { name: 'Dog Mom Keychain | Retro Beaded Charm', image: '/images/products/Dog-Mom-Keychain-1.png' },
    { name: 'Dripping Cherries Car Mirror Air Freshener', image: '/images/products/Dripping-Cherries-Car-Mirror-Air-Freshener-1.png' },
    { name: 'Mama Car Mirror Air Freshener', image: '/images/products/Mama-Car-Mirror-Air-Freshener-1.png' },
    { name: 'Sunflower Car Mirror Air Freshener', image: '/images/products/Sunflower-Car-Mirror-Air-Freshener-1.png' },
    { name: 'Sunflower Car Vent Clip Air Freshener', image: '/images/products/Sunflower-Car-Vent-Clip-Air-Freshener-1.png' },
    { name: 'Highland Cow Car Vent Clip Air Freshener', image: '/images/products/Highland-Cow-Car-Vent-Clip-Air-Freshener-1.png' },
    { name: 'Silicone Keychain Charm | Bee Focal Bead', image: '/images/products/Silicone-Keychain-Charm-Bee-Focal-Bead-1.png' },
    { name: 'Silicone Wristlet Keychain | Purple', image: '/images/products/Silicone-Wristlet-Keychain-Purple-1.png' },
    { name: 'Silicone Wristlet Keychain with Leaf Beads', image: '/images/products/Silicone-Wristlet-Keychain-with-Leaf-Beads-1.png' },
    { name: 'Humorous Car Vent Clip Freshie | My Driving Scares Me Too', image: '/images/products/Humorous-Car-Vent-Clip-Freshie-1.png' }
  ];

  for (const upd of updates) {
    const result = await db.collection('products').updateOne(
      { name: upd.name },
      { $set: { 'images.0.url': upd.image } }
    );
    if (result.matchedCount > 0) {
      console.log('✓ Updated:', upd.name);
    } else {
      console.log('✗ Not found:', upd.name);
    }
  }

  console.log('\n✓ Done updating product images');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
