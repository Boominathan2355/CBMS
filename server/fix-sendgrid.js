#!/usr/bin/env node

/**
 * SendGrid Quick Fix Script
 * 
 * This script helps fix common SendGrid issues
 * Run with: node fix-sendgrid.js
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const checkSenderVerification = async () => {
  console.log('🔍 Checking SendGrid sender verification...');
  
  try {
    // Try to get sender identities
    const response = await sgMail.request({
      method: 'GET',
      url: '/v3/verified_senders'
    });
    
    console.log('✅ Verified senders found:');
    response.body.results.forEach(sender => {
      console.log(`   - ${sender.from_email} (${sender.from_name})`);
    });
    
    return response.body.results;
  } catch (error) {
    console.error('❌ Error checking verified senders:', error.message);
    return [];
  }
};

const testWithVerifiedSender = async (verifiedSenders) => {
  if (verifiedSenders.length === 0) {
    console.log('⚠️  No verified senders found. You need to verify a sender first.');
    return false;
  }
  
  // Use the first verified sender
  const verifiedSender = verifiedSenders[0];
  console.log(`🧪 Testing with verified sender: ${verifiedSender.from_email}`);
  
  try {
    const msg = {
      to: process.env.TEST_EMAIL || 'boominathan2355@gmail.com',
      from: {
        email: verifiedSender.from_email,
        name: verifiedSender.from_name
      },
      subject: 'CBMS SendGrid Test - Using Verified Sender',
      text: 'This is a test email using a verified sender.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">CBMS SendGrid Test</h2>
          <p>This email was sent using a verified sender: <strong>${verifiedSender.from_email}</strong></p>
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Status:</strong> ✅ Success</p>
            <p><strong>Verified Sender:</strong> ${verifiedSender.from_email}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <p>SendGrid integration is working correctly!</p>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully with verified sender!');
    console.log('📧 Response:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ Email failed even with verified sender:', error.message);
    if (error.response) {
      console.error('📋 Error details:', error.response.body);
    }
    return false;
  }
};

const provideSolutions = () => {
  console.log('\n🔧 Solutions to fix the sender verification issue:');
  console.log('\n1. **Verify Single Sender (Recommended)**');
  console.log('   - Go to: https://app.sendgrid.com/settings/sender_auth');
  console.log('   - Click "Verify a Single Sender"');
  console.log('   - Use your email: boominathanalagirisamy@gmail.com');
  console.log('   - Check your email and click the verification link');
  
  console.log('\n2. **Update Environment Variables**');
  console.log('   - After verification, update your .env file:');
  console.log('   - EMAIL_FROM=boominathanalagirisamy@gmail.com');
  console.log('   - EMAIL_FROM_NAME=CBMS System');
  
  console.log('\n3. **Alternative: Use a Different Email**');
  console.log('   - Use an email that\'s already verified in SendGrid');
  console.log('   - Update EMAIL_FROM in your .env file');
  
  console.log('\n4. **Domain Authentication (For Production)**');
  console.log('   - Go to: https://app.sendgrid.com/settings/sender_auth');
  console.log('   - Click "Authenticate Your Domain"');
  console.log('   - Follow DNS setup instructions');
  
  console.log('\n5. **Test Again**');
  console.log('   - Run: node test-sendgrid.js');
  console.log('   - Or run: node fix-sendgrid.js');
};

const main = async () => {
  console.log('🚀 SendGrid Quick Fix Tool\n');
  
  // Check if API key is set
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('Please set SENDGRID_API_KEY in your .env file');
    process.exit(1);
  }
  
  console.log('📋 Current Configuration:');
  console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   From Email: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`   From Name: ${process.env.EMAIL_FROM_NAME || 'Not set'}`);
  console.log(`   Test Email: ${process.env.TEST_EMAIL || 'boominathan2355@gmail.com'}\n`);
  
  // Check verified senders
  const verifiedSenders = await checkSenderVerification();
  
  if (verifiedSenders.length > 0) {
    console.log('\n🧪 Testing with verified sender...');
    const success = await testWithVerifiedSender(verifiedSenders);
    
    if (success) {
      console.log('\n🎉 Success! You can now use the verified sender in your .env file:');
      console.log(`   EMAIL_FROM=${verifiedSenders[0].from_email}`);
      console.log(`   EMAIL_FROM_NAME=${verifiedSenders[0].from_name}`);
    }
  } else {
    console.log('\n⚠️  No verified senders found.');
  }
  
  // Provide solutions
  provideSolutions();
  
  console.log('\n📚 For more help, check:');
  console.log('   - SENDGRID_SETUP.md');
  console.log('   - SENDGRID_FIX.md');
  console.log('   - https://sendgrid.com/docs/for-developers/sending-email/sender-identity/');
};

// Run the fix tool
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  checkSenderVerification,
  testWithVerifiedSender,
  provideSolutions
};
