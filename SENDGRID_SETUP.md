# SendGrid Email Configuration Guide

This guide explains how to configure SendGrid for email notifications in the CBMS system.

## 📧 SendGrid Setup

### 1. Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account
3. Verify your email address
4. Complete account setup

### 2. Generate API Key

1. Log in to your SendGrid dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** for security
5. Select permissions:
   - **Mail Send**: Full Access
   - **Mail Settings**: Read Access
   - **Suppressions**: Read Access
6. Copy the generated API key (you won't see it again!)

### 3. Verify Sender Identity

#### Option A: Single Sender Verification
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Name**: CBMS System
   - **From Email**: noreply@yourdomain.com
   - **Reply To**: support@yourdomain.com
   - **Company Address**: Your company address
4. Check your email and click the verification link

#### Option B: Domain Authentication (Recommended)
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Enter your domain name
4. Follow the DNS setup instructions
5. Verify domain ownership

### 4. Environment Configuration

Add these variables to your `.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=CBMS System
```

### 5. Optional: Dynamic Templates

For advanced email templates, you can create dynamic templates in SendGrid:

1. Go to **Email API** → **Dynamic Templates**
2. Create templates for different email types:
   - Welcome email
   - Password reset
   - Expenditure approval
   - Expenditure rejection
   - System notifications

3. Add template IDs to your `.env`:
```env
SENDGRID_WELCOME_TEMPLATE_ID=d-welcome-template-id
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-password-reset-template-id
SENDGRID_EXPENDITURE_APPROVAL_TEMPLATE_ID=d-approval-template-id
SENDGRID_EXPENDITURE_REJECTION_TEMPLATE_ID=d-rejection-template-id
```

## 🔧 Implementation

### Basic Email Service

```javascript
const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send simple email
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME
    },
    subject,
    text,
    html
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
```

### Using Dynamic Templates

```javascript
// Send email using dynamic template
const sendTemplateEmail = async (to, templateId, dynamicData) => {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME
    },
    templateId,
    dynamicTemplateData: dynamicData
  };

  try {
    await sgMail.send(msg);
    console.log('Template email sent successfully');
  } catch (error) {
    console.error('Error sending template email:', error);
    throw error;
  }
};
```

### Email Templates

#### Welcome Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to CBMS</title>
</head>
<body>
    <h1>Welcome to CBMS!</h1>
    <p>Hello {{name}},</p>
    <p>Welcome to the College Budget Management System. Your account has been created successfully.</p>
    <p>Your login credentials:</p>
    <ul>
        <li>Email: {{email}}</li>
        <li>Role: {{role}}</li>
    </ul>
    <p>Please log in and change your password.</p>
    <p>Best regards,<br>CBMS Team</p>
</body>
</html>
```

#### Expenditure Approval Template
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Expenditure Approved</title>
</head>
<body>
    <h1>Expenditure Request Approved</h1>
    <p>Hello {{userName}},</p>
    <p>Your expenditure request has been approved.</p>
    <p>Details:</p>
    <ul>
        <li>Amount: {{amount}}</li>
        <li>Description: {{description}}</li>
        <li>Approved by: {{approvedBy}}</li>
        <li>Date: {{approvalDate}}</li>
    </ul>
    <p>Thank you for using CBMS.</p>
    <p>Best regards,<br>CBMS Team</p>
</body>
</html>
```

## 📊 Email Analytics

SendGrid provides analytics for your emails:

1. **Delivery Statistics**: Track email delivery rates
2. **Open Rates**: Monitor email open rates
3. **Click Tracking**: Track link clicks
4. **Bounce Management**: Handle bounced emails
5. **Unsubscribe Management**: Manage unsubscribe requests

## 🔒 Security Best Practices

1. **API Key Security**:
   - Store API key in environment variables
   - Use restricted API keys with minimal permissions
   - Rotate API keys regularly

2. **Email Validation**:
   - Validate email addresses before sending
   - Use SendGrid's email validation API
   - Implement rate limiting for email sending

3. **Content Security**:
   - Sanitize user input in email content
   - Use HTTPS for all email-related requests
   - Implement proper error handling

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Verify API key is correct
   - Check API key permissions
   - Ensure API key is not expired

2. **Emails Not Delivered**:
   - Check sender verification status
   - Verify domain authentication
   - Check spam folder
   - Review SendGrid activity logs

3. **Template Errors**:
   - Verify template ID is correct
   - Check dynamic data format
   - Ensure template is published

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Enable debug mode
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setSubstitutionWrappers('{{', '}}');

// Add debug logging
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: {
      email: process.env.EMAIL_FROM,
      name: process.env.EMAIL_FROM_NAME
    },
    subject,
    text,
    html
  };

  console.log('Sending email:', JSON.stringify(msg, null, 2));

  try {
    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error.response?.body || error);
    throw error;
  }
};
```

## 📈 Monitoring and Alerts

Set up monitoring for your email service:

1. **Delivery Monitoring**: Track email delivery rates
2. **Error Alerts**: Get notified of email failures
3. **Performance Metrics**: Monitor email sending performance
4. **Usage Tracking**: Track API usage and limits

## 🔄 Migration from Other Email Services

If migrating from other email services:

1. **Export Templates**: Export existing email templates
2. **Update Configuration**: Change environment variables
3. **Test Thoroughly**: Test all email functionality
4. **Monitor Delivery**: Watch delivery rates closely
5. **Update Documentation**: Update system documentation

## 📞 Support

For SendGrid-specific issues:
- **SendGrid Support**: [SendGrid Support Center](https://support.sendgrid.com/)
- **Documentation**: [SendGrid API Documentation](https://docs.sendgrid.com/)
- **Community**: [SendGrid Community](https://community.sendgrid.com/)

For CBMS-specific email issues:
- **GitHub Issues**: Create an issue in the repository
- **Documentation**: Check the main README
- **Community**: Join our Discord server
