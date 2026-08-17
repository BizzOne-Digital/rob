require('dotenv').config({ path: '.env.local' });
const { SquareClient, SquareEnvironment } = require('square');

async function testPaymentLink() {
  console.log('\n=== Testing Square Payment Link Creation ===\n');
  
  const client = new SquareClient({
    bearerAuthCredentials: {
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
    },
    environment: SquareEnvironment.Production,
  });

  const locationId = process.env.SQUARE_LOCATION_ID;
  
  console.log('Location ID:', locationId);
  console.log('Creating test payment link...\n');

  try {
    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: `test-${Date.now()}`,
      order: {
        locationId: locationId,
        lineItems: [{
          name: 'Test Product',
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(1000), // $10.00
            currency: 'CAD',
          },
        }],
      },
      checkoutOptions: {
        redirectUrl: 'http://localhost:3000/order-success?order=TEST',
      },
      prePopulatedData: {
        buyerEmail: 'customer@rwdesignscanada.com',
      },
    });

    console.log('✅ SUCCESS! Payment link created\n');
    console.log('Response structure:');
    console.log(JSON.stringify(response, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2));
    
    console.log('\n=== Accessing Payment Link URL ===\n');
    
    if (response.result?.paymentLink?.url) {
      console.log('✅ Path: response.result.paymentLink.url');
      console.log('URL:', response.result.paymentLink.url);
    } else if (response.paymentLink?.url) {
      console.log('✅ Path: response.paymentLink.url');
      console.log('URL:', response.paymentLink.url);
    } else {
      console.log('❌ Could not find payment link URL in response');
      console.log('Available keys:', Object.keys(response));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
  }
}

testPaymentLink();
