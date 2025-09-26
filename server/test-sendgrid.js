#!/usr/bin/env node

/**
 * SendGrid Integration Test Script
 * 
 * This script tests the SendGrid email integration for CBMS
 * Run with: node test-sendgrid.js
 */

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Test email configuration
const testConfig = {
  from: {
    email: process.env.EMAIL_FROM || 'test@example.com',
    name: process.env.EMAIL_FROM_NAME || 'CBMS Test'
  },
  to: process.env.TEST_EMAIL || 'boominathan2355@gmail.com'
};

// Test functions
const testBasicEmail = async () => {
  console.log('🧪 Testing basic email sending...');
  
  try {
    const msg = {
      to: testConfig.to,
      from: testConfig.from,
      subject: 'CBMS SendGrid Test - Basic Email',
      text: 'This is a test email from CBMS to verify SendGrid integration.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">CBMS SendGrid Integration Test</h2>
          <p>This is a test email to verify that SendGrid is working correctly.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Test Type:</strong> Basic Email</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Status:</strong> ✅ Success</p>
          </div>
          <p>If you received this email, SendGrid integration is working properly!</p>
        </div>
      `
    };

    const response = await sgMail.send(msg);
    console.log('✅ Basic email sent successfully!');
    console.log('📧 Response:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ Basic email failed:', error.message);
    if (error.response) {
      console.error('📋 Error details:', error.response.body);
    }
    return false;
  }
};

const testTemplateEmail = async () => {
  console.log('🧪 Testing template email sending...');
  
  // Check if template ID is configured
  const templateId = process.env.SENDGRID_WELCOME_TEMPLATE_ID;
  if (!templateId) {
    console.log('⚠️  No template ID configured, skipping template test');
    return true;
  }

  try {
    const msg = {
      to: testConfig.to,
      from: testConfig.from,
      templateId: templateId,
      dynamicTemplateData: {
        name: 'Test User',
        email: testConfig.to,
        role: 'Test Role',
        loginUrl: 'http://localhost:3000/login'
      }
    };

    const response = await sgMail.send(msg);
    console.log('✅ Template email sent successfully!');
    console.log('📧 Response:', response[0].statusCode);
    return true;
  } catch (error) {
    console.error('❌ Template email failed:', error.message);
    if (error.response) {
      console.error('📋 Error details:', error.response.body);
    }
    return false;
  }
};

const testNotificationService = async () => {
  console.log('🧪 Testing notification service...');
  
  try {
    // Import the notification service
    const notificationService = require('./utils/notificationService');
    
    // Test data
    const testData = {
      billNumber: 'TEST-001',
      billAmount: 1000,
      partyName: 'Test Party',
      department: 'Test Department',
      budgetHead: 'Test Budget Head'
    };

    // Test email notification
    await notificationService.sendEmailNotification(
      testConfig.to,
      'expenditure_submitted',
      testData
    );
    
    console.log('✅ Notification service test completed!');
    return true;
  } catch (error) {
    console.error('❌ Notification service test failed:', error.message);
    return false;
  }
};

const validateConfiguration = () => {
  console.log('🔍 Validating SendGrid configuration...');
  
  const requiredVars = [
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'EMAIL_FROM_NAME'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  
  // Validate API key format
  if (!process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.warn('⚠️  SENDGRID_API_KEY should start with "SG."');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(process.env.EMAIL_FROM)) {
    console.warn('⚠️  EMAIL_FROM should be a valid email address');
  }
  
  return true;
};

const main = async () => {
  console.log('🚀 Starting SendGrid Integration Tests\n');
  
  // Validate configuration
  if (!validateConfiguration()) {
    console.log('\n❌ Configuration validation failed. Please check your environment variables.');
    process.exit(1);
  }
  
  console.log('\n📋 Configuration:');
  console.log(`   API Key: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   From Email: ${process.env.EMAIL_FROM}`);
  console.log(`   From Name: ${process.env.EMAIL_FROM_NAME}`);
  console.log(`   Test Email: ${testConfig.to}\n`);
  
  // Run tests
  const results = [];
  
  results.push(await testBasicEmail());
  console.log('');
  
  results.push(await testTemplateEmail());
  console.log('');
  
  results.push(await testNotificationService());
  console.log('');
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! SendGrid integration is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the configuration and try again.');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  testBasicEmail,
  testTemplateEmail,
  testNotificationService,
  validateConfiguration
};
