// test-email-delivery.js
require('dotenv').config();
const Mailjet = require('node-mailjet');

console.log('📧 MAILJET DELIVERY TEST');
console.log('========================\n');

const fromEmail = process.env.FROM_EMAIL;
const publicKey = process.env.Node_MailJet_APIKEY_PUBLIC;
const privateKey = process.env.Node_MailJet_APIKEY_PRIVATE;

const mailjet = Mailjet.apiConnect(publicKey, privateKey);

// Test to multiple email providers
const testEmails = [
  'atnestly@gmail.com',
  // Add more test emails here if you have them:
  'ialainquentin@gmail.com',
  'q.rurangirw@alustudent.com',
];

async function sendTestEmails() {
  for (const testEmail of testEmails) {
    console.log(`\n📨 Sending test email to: ${testEmail}`);
    
    try {
      const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: fromEmail,
                Name: 'Nestly Test'
              },
              To: [
                {
                  Email: testEmail,
                  Name: 'Test Recipient'
                }
              ],
              Subject: `Test Email ${new Date().toLocaleString()} - Please Check`,
              TextPart: 'If you receive this email, your Mailjet setup is working!',
              HTMLPart: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #1995AD;">✅ Email Delivery Test</h1>
                    <p style="font-size: 16px;">This is a test email sent at: <strong>${new Date().toLocaleString()}</strong></p>
                    <p>If you see this, your email delivery is working correctly!</p>
                    <div style="background: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <p style="margin: 0;"><strong>From:</strong> ${fromEmail}</p>
                      <p style="margin: 5px 0 0 0;"><strong>To:</strong> ${testEmail}</p>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                      <strong>Next steps:</strong><br>
                      1. Check your inbox<br>
                      2. Check spam/junk folder<br>
                      3. Check promotions tab (Gmail)<br>
                      4. Mark as "Not Spam" if found in spam
                    </p>
                  </div>
                </div>
              `
            }
          ]
        });

      const result = await request;
      console.log(`   ✅ Sent! Message ID: ${result.body.Messages[0].To[0].MessageID}`);
      console.log(`   📊 Status: ${result.body.Messages[0].Status}`);
      
      // Check detailed response
      if (result.body.Messages[0].To[0].Status) {
        console.log(`   📍 Delivery Status: ${result.body.Messages[0].To[0].Status}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed to send to ${testEmail}:`, error.message);
    }
  }

  console.log('\n\n📋 NEXT STEPS:');
  console.log('===============');
  console.log('1. Check your email inbox (wait 1-2 minutes)');
  console.log('2. Check SPAM/JUNK folder');
  console.log('3. Check Gmail tabs: Promotions, Social, Updates');
  console.log('4. Go to Mailjet dashboard: https://app.mailjet.com/stats');
  console.log('   → Check "Statistics" → "Messages"');
  console.log('   → Look for the message ID printed above');
  console.log('   → Check delivery status');
  console.log('\n5. If email is in spam:');
  console.log('   → Mark as "Not Spam"');
  console.log('   → Add sender to contacts');
  console.log('   → Create filter to never send to spam');
}

sendTestEmails().catch(console.error);