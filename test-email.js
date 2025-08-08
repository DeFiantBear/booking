// Test script to verify email configuration
// Run with: node test-email.js

require('dotenv').config({ path: '.env.local' });

const { Resend } = require('resend');

async function testEmailSetup() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('1. Checking environment variables:');
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
  if (process.env.RESEND_API_KEY) {
    console.log(`   API Key starts with: ${process.env.RESEND_API_KEY.substring(0, 10)}...`);
  }
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ Set' : '❌ Missing'}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.log('\n❌ RESEND_API_KEY is not set. Please add it to your .env.local file.');
    console.log('   Example: RESEND_API_KEY=re_your_actual_api_key_here');
    return;
  }

  // Test Resend connection
  console.log('\n2. Testing Resend connection:');
  try {
    console.log('   Creating Resend instance...');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Try to send a test email
    const testEmailData = {
      from: 'VR Arcade <contact@secondcitystudio.xyz>',
      to: [process.env.ADMIN_EMAIL || 'contact@secondcitystudio.xyz'],
      subject: 'Test Email - VR Arcade Booking System',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify your email configuration is working.</p>
        <p>If you receive this email, your setup is correct!</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    };

    console.log('   Sending test email...');
    console.log('   From:', testEmailData.from);
    console.log('   To:', testEmailData.to[0]);
    
    const { data, error } = await resend.emails.send(testEmailData);
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log('   💡 Common issues:');
      console.log('      - Invalid API key');
      console.log('      - Domain not verified');
      console.log('      - Account suspended');
    } else {
      console.log(`   ✅ Test email sent successfully!`);
      console.log(`   📧 Email ID: ${data.id}`);
      console.log(`   📧 To: ${testEmailData.to[0]}`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
  }

  console.log('\n3. Next steps:');
  console.log('   - If the test email was sent successfully, your email system is working!');
  console.log('   - If there were errors, check the troubleshooting guide in EMAIL_SETUP.md');
  console.log('   - Make sure to restart your development server after setting environment variables');
}

testEmailSetup().catch(console.error); 