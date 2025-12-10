/**
 * Email Service Utility
 * Lightweight wrapper for sending custom emails using SendGrid
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send a custom email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html) => {
    try {
        const msg = {
            to,
            from: {
                email: process.env.EMAIL_FROM || 'noreply@cbms.com',
                name: process.env.EMAIL_FROM_NAME || 'CBMS System'
            },
            subject,
            html
        };

        await sgMail.send(msg);
        console.log(`[Email Service] Email sent successfully to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('[Email Service] Error sending email:', error);

        // Handle specific SendGrid errors
        if (error.response) {
            const { body } = error.response;
            console.error('[Email Service] SendGrid Error Response:', body);

            // Check for sender verification issues
            if (body.errors && body.errors.some(err =>
                err.message.includes('verified Sender Identity') ||
                err.message.includes('sender authentication')
            )) {
                console.error('🚨 SENDER VERIFICATION REQUIRED:');
                console.error(`Please verify "${process.env.EMAIL_FROM}" at: https://app.sendgrid.com/settings/sender_auth`);
            }
        }

        throw error;
    }
};

/**
 * Send email using SendGrid dynamic template
 * @param {string} to - Recipient email address
 * @param {string} templateId - SendGrid template ID
 * @param {object} dynamicData - Data to populate template
 * @returns {Promise<void>}
 */
const sendTemplateEmail = async (to, templateId, dynamicData) => {
    try {
        const msg = {
            to,
            from: {
                email: process.env.EMAIL_FROM || 'noreply@cbms.com',
                name: process.env.EMAIL_FROM_NAME || 'CBMS System'
            },
            templateId,
            dynamicTemplateData: dynamicData
        };

        await sgMail.send(msg);
        console.log(`[Email Service] Template email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('[Email Service] Error sending template email:', error);
        throw error;
    }
};

/**
 * Send bulk emails
 * @param {Array<{to: string, subject: string, html: string}>} emails - Array of email objects
 * @returns {Promise<{success: number, failed: number}>}
 */
const sendBulkEmails = async (emails) => {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
        try {
            await sendEmail(email.to, email.subject, email.html);
            success++;
        } catch (error) {
            console.error(`[Email Service] Failed to send to ${email.to}:`, error.message);
            failed++;
        }
    }

    console.log(`[Email Service] Bulk send complete: ${success} successful, ${failed} failed`);
    return { success, failed };
};

module.exports = {
    sendEmail,
    sendTemplateEmail,
    sendBulkEmails
};
