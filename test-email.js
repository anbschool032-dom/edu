// test-email.js
require('dotenv').config();
const { sendVerificationEmail } = require('./services/email.service');

const testEmail = async () => {
  try {
    console.log('Testing email with:', process.env.EMAIL_USER);
    await sendVerificationEmail('emsokhai974@gmail.com', 'test-token-123', 'admin');
    console.log('✅ Test email sent successfully!');
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};

testEmail();