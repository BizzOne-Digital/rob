require('dotenv').config({ path: '.env.local' });
const { SquareClient, SquareEnvironment } = require('square');

async function testSquareCredentials() {
  console.log('\n=== Testing Square Credentials ===\n');
  
  const accessToken = process.env.SQUARE_ACCESS_TOKEN || process.env.SQUARE_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
  
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 10)}...` : 'NOT SET');
  console.log('Location ID:', locationId || 'NOT SET');
  console.log('Application ID:', appId || 'NOT SET');
  
  if (!accessToken) {
    console.error('\n❌ Error: SQUARE_ACCESS_TOKEN is not set');
    process.exit(1);
  }
  
  // Test both Production and Sandbox environments
  for (const env of ['Production', 'Sandbox']) {
    try {
      console.log(`\n\n=== Testing ${env} Environment ===\n`);
      
      const client = new SquareClient({
        bearerAuthCredentials: {
          accessToken: accessToken,
        },
        environment: SquareEnvironment[env],
      });
      
      console.log(`✅ Square client created for ${env}`);
      console.log(`Using API URL: ${SquareEnvironment[env]}`);
      console.log('\n=== Fetching Available Locations ===\n');
      
      const response = await client.locations.list();
      
      const locations = response.result?.locations || [];
      
      if (locations.length > 0) {
        console.log(`✅ Found ${locations.length} location(s) in ${env}:\n`);
        
        locations.forEach((location, index) => {
          console.log(`Location ${index + 1}:`);
          console.log(`  ID: ${location.id}`);
          console.log(`  Name: ${location.name}`);
          console.log(`  Status: ${location.status}`);
          console.log(`  Address: ${location.address?.addressLine1 || 'N/A'}, ${location.address?.locality || 'N/A'}`);
          console.log(`  Country: ${location.country || 'N/A'}`);
          console.log(`  Currency: ${location.currency || 'N/A'}`);
          console.log('');
        });
        
        console.log(`\n=== ✅ SUCCESS - Use ${env} Environment ===`);
        console.log(`Update your .env.local file with the correct Location ID from above.`);
        console.log(`The environment should be set to: ${env}`);
        
        return; // Exit after finding working environment
        
      } else {
        console.log(`❌ No locations found in ${env} environment`);
      }
      
    } catch (error) {
      console.error(`\n❌ Error testing ${env} environment:`, error.message);
      if (error.errors) {
        console.error('Details:', JSON.stringify(error.errors, null, 2));
      }
    }
  }
  
  console.log('\n\n❌ No locations found in either Production or Sandbox environments');
  console.log('Please verify:');
  console.log('1. Your Square account has at least one location set up');
  console.log('2. The access token is correct');
  console.log('3. The access token has the necessary permissions');
}

testSquareCredentials();
