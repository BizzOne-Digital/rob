require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const productImages = {
  'Sunflower Car Mirror Air Freshener': {
    image1: '/images/products/Sunflower-Car-Mirror-Air-Freshener-1.png',
    image2: '/images/products/Sunflower-Car-Mirror-Air-Freshener-2.png'
  },
  'Silicone Keychain Charm | Bee Focal Bead': {
    image1: '/images/products/Silicone-keychain-charm-1.png',
    image2: '/images/products/Silicone-keychain-charm-2.png'
  },
  'Mama Car Mirror Air Freshener': {
    image1: '/images/products/Mama-Car-Mirror-Air-1.png',
    image2: '/images/products/Mama-Car-Mirror-Air-2.png'
  },
  'Dripping Cherries Car Mirror Air Freshener': {
    image1: '/images/products/Dripping-Cherries-Car-Mirror-Air-Freshener-1.png',
    image2: '/images/products/Dripping-Cherries-Car-Mirror-Air-Freshener-2.png'
  },
  'Butterfly Car Vent Clip Freshie': {
    image1: '/images/products/Butterfly-Car-Vent-Clip-Freshie-1.png',
    image2: '/images/products/Butterfly-Car-Vent-Clip-Freshie-2.png'
  },
  'Highland Cow Car Vent Clip Air Freshener': {
    image1: '/images/products/Highland-Cow-Car-Vent-Clip-Air-Freshener-1.png',
    image2: '/images/products/Highland-Cow-Car-Vent-Clip-Air-Freshener-2.png'
  },
  'Dog Mom Keychain | Retro Beaded Charm': {
    image1: '/images/products/Dog-Mom-Keychain-1.png',
    image2: '/images/products/Dog-Mom-Keychain-2.png'
  },
  'Silicone Wristlet Keychain | Purple': {
    image1: '/images/products/Silicone-Wristlet-Keychain-1.png',
    image2: '/images/products/Silicone-Wristlet-Keychain-2.png'
  },
  'Silicone Wristlet Keychain with Leaf Beads': {
    image1: '/images/products/Silicone-Wristlet-Keychain-with-Leaf-Beads-1.png',
    image2: '/images/products/Silicone-Wristlet-Keychain-with-Leaf-Beads-2.png'
  },
  'Humorous Car Vent Clip Freshie | My Driving Scares Me Too': {
    image1: '/images/products/Humorous-Car-Vent-Clip-Freshie-1.png',
    image2: '/images/products/Humorous-Car-Vent-Clip-Freshie-2.png'
  },
  'Sunflower Car Vent Clip Air Freshener': {
    image1: '/images/products/Sunflower-Car-Vent-Clip-Air-Freshener-1.png',
    image2: '/images/products/Sunflower-Car-Vent-Clip-Air-Freshener-2.png'
  }
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('\n=== Updating Product Images ===\n');
  
  for (const [productName, images] of Object.entries(productImages)) {
    const result = await db.collection('products').updateOne(
      { name: productName },
      {
        $set: {
          images: [
            {
              url: images.image1,
              alt: productName,
              isPrimary: true
            },
            {
              url: images.image2,
              alt: productName,
              isPrimary: false
            }
          ]
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✓ Updated: ${productName}`);
    } else {
      console.log(`⊘ Not found: ${productName}`);
    }
  }
  
  console.log('\n✓ Done updating all product images\n');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
