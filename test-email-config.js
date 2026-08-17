require('dotenv').config({ path: '.env.local' });

async function testEmailConfiguration() {
  console.log('\n=== Testing Email Configuration ===\n');
  
  // Check Resend configuration
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;
  const contactEmail = process.env.CONTACT_RECIPIENT_EMAIL;
  
  console.log('📧 Resend Configuration:');
  console.log('  RESEND_API_KEY:', resendApiKey ? '✅ SET' : '❌ NOT SET');
  console.log('  EMAIL_FROM:', emailFrom || '❌ NOT SET');
  console.log('  CONTACT_RECIPIENT_EMAIL:', contactEmail || '❌ NOT SET');
  
  // Check SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;
  
  console.log('\n📨 SMTP Configuration:');
  console.log('  SMTP_HOST:', smtpHost || '❌ NOT SET');
  console.log('  SMTP_PORT:', smtpPort || '❌ NOT SET');
  console.log('  SMTP_USER:', smtpUser || '❌ NOT SET');
  console.log('  SMTP_PASS:', smtpPass ? '✅ SET' : '❌ NOT SET');
  console.log('  SMTP_FROM:', smtpFrom || '❌ NOT SET');
  
  console.log('\n=== Summary ===\n');
  
  const resendConfigured = resendApiKey && emailFrom && contactEmail;
  const smtpConfigured = smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom;
  
  if (resendConfigured) {
    console.log('✅ Resend is CONFIGURED');
    console.log('   Emails will be sent using Resend service');
    
    // Try to test Resend connection
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);
      console.log('   Resend client initialized successfully');
      
      console.log('\n⚠️  To fully test, send a test email from the app');
      console.log('   (e.g., place an order or submit contact form)');
      
    } catch (error) {
      console.log('   ⚠️  Warning: Could not initialize Resend client');
      console.log('   Error:', error.message);
    }
  } else {
    console.log('❌ Resend is NOT configured');
    console.log('   Missing:', [
      !resendApiKey && 'RESEND_API_KEY',
      !emailFrom && 'EMAIL_FROM',
      !contactEmail && 'CONTACT_RECIPIENT_EMAIL'
    ].filter(Boolean).join(', '));
  }
  
  console.log('');
  
  if (smtpConfigured) {
    console.log('✅ SMTP is CONFIGURED');
    console.log('   Emails will be sent using SMTP server');
    console.log('   Server: ' + smtpHost + ':' + smtpPort);
    
    // Try to test SMTP connection
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      
      console.log('\n   Testing SMTP connection...');
      
      await transporter.verify();
      console.log('   ✅ SMTP connection successful!');
      console.log('   Your SMTP server is reachable and credentials are valid');
      
    } catch (error) {
      console.log('   ❌ SMTP connection FAILED');
      console.log('   Error:', error.message);
      console.log('\n   Possible issues:');
      console.log('   - Wrong host or port');
      console.log('   - Incorrect username/password');
      console.log('   - Firewall blocking connection');
      console.log('   - SMTP server requires different settings');
    }
  } else {
    console.log('❌ SMTP is NOT configured');
    console.log('   Missing:', [
      !smtpHost && 'SMTP_HOST',
      !smtpPort && 'SMTP_PORT',
      !smtpUser && 'SMTP_USER',
      !smtpPass && 'SMTP_PASS',
      !smtpFrom && 'SMTP_FROM'
    ].filter(Boolean).join(', '));
  }
  
  console.log('\n=== Recommendation ===\n');
  
  if (!resendConfigured && !smtpConfigured) {
    console.log('⚠️  NO email service is configured!');
    console.log('   Order confirmations and contact form emails will NOT be sent.');
    console.log('\n   Please configure either:');
    console.log('   1. Resend (recommended, easier setup)');
    console.log('   2. SMTP (traditional email server)');
    console.log('\n   See EMAIL_SETUP.md for instructions.');
  } else if (resendConfigured && smtpConfigured) {
    console.log('ℹ️  Both Resend and SMTP are configured');
    console.log('   The app will prefer SMTP if both are available.');
    console.log('   Consider removing one to avoid confusion.');
  } else if (resendConfigured) {
    console.log('✅ Email is ready to use via Resend');
  } else if (smtpConfigured) {
    console.log('✅ Email is ready to use via SMTP');
  }
  
  console.log('');
}

testEmailConfiguration().catch(error => {
  console.error('\n❌ Unexpected error:', error.message);
  process.exit(1);
});
