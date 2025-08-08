// Simple email test script
require('dotenv').config({ path: '.env.local' });

const { Resend } = require('resend');

async function testEmail() {
  console.log('🧪 Simple Email Test');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'Not set');
  
  if (!process.env.RESEND_API_KEY) {
    console.log('❌ RESEND_API_KEY not found');
    return;
  }
  
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend instance created');
    
    const result = await resend.emails.send({
      from: 'VR Arcade <contact@secondcitystudio.xyz>',
      to: [process.env.ADMIN_EMAIL || 'contact@secondcitystudio.xyz'],
      subject: 'Test Email',
      html: '<h1>Test</h1><p>This is a test email.</p>'
    });
    
    console.log('✅ Email sent successfully:', result.data?.id);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testEmail(); 