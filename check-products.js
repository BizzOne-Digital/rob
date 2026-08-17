require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const count = await db.collection('products').countDocuments({ status: 'published' });
  
  console.log('\n=== Product Status ===\n');
  console.log('Published products:', count);
  
  if (count === 0) {
    console.log('\n❌ No products found! Run: npm run seed:catalog');
  } else {
    const products = await db.collection('products').find({ status: 'published' }).limit(5).toArray();
    console.log('\nFirst 5 products:');
    products.forEach(p => console.log(`  - ${p.name}`));
  }
  
  process.exit(0);
}).catch(err => {
  console.error('❌ Database Error:', err.message);
  process.exit(1);
});
