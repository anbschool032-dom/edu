// services/telegram.service.js
const axios = require('axios');
require('dotenv').config(); // ✅ ហៅ dotenv ដើម្បីអាន .env

// ✅ ហៅ Token និង Chat ID ពី .env (កុំដាក់លេខផ្ទាល់នៅទីនេះទៀត)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CREATE_USER_CHAT_ID = process.env.TELEGRAM_CREATE_USER_CHAT_ID;
const TELEGRAM_LOGIN_CHAT_ID = process.env.TELEGRAM_LOGIN_CHAT_ID;

// Function 1: សម្រាប់ User ថ្មី (ផ្ញើទៅ Group ទី ១)
const sendTelegramNotification = async (data, creatorName) => {
  try {
    // បើអត់មាន Token កុំដំណើរការ (ការពារ Error)
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CREATE_USER_CHAT_ID) {
      console.warn("⚠️ Telegram Token or Chat ID is missing in .env");
      return;
    }

    const date = new Date().toLocaleDateString('en-GB');
    const fullName = `${data.first_name} ${data.last_name}`;
    const role = data.role_name ? data.role_name.toUpperCase() : 'UNKNOWN';
    
    let extraInfo = '';
    if (data.role_name === 'user') {
        extraInfo = `\n🏫 Institution: ${data.institution_name || '-'}\n🎓 Type: ${data.types_user || '-'}`;
    } else if (data.role_name === 'mentor') {
        extraInfo = `\n🏢 Company: ${data.company_name || '-'}\n💼 Job Title: ${data.job_title || '-'}\n🌟 Expertise: ${data.expertise_areas || '-'}`;
    } else if (data.role_name === 'admin') {
        extraInfo = `\n📱 Admin Phone: ${data.phone || '-'}`;
    }

    const message = `
🚀 <b>New User Created!</b>
━━━━━━━━━━━━━━━
📅 Date: ${date}
👤 Name: <b>${fullName}</b>
📧 Email: ${data.email}
📞 Phone: ${data.phone || '-'}
🚻 Gender: ${data.gender || '-'}
🏷 Role: <b>${role}</b>${extraInfo}
━━━━━━━━━━━━━━━
🛠 Created By: ${creatorName || 'System'}
    `;

    // ផ្ញើទៅ TELEGRAM_CREATE_USER_CHAT_ID
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CREATE_USER_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('✅ Create User Notification sent!');
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error.message);
  }
};

// Function 2: សម្រាប់ Login (ផ្ញើទៅ Group ទី ២)
const sendLoginNotification = async (email, role, ip) => {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_LOGIN_CHAT_ID) {
      // មិនបាច់ Warn រំខានពេកទេសម្រាប់ Login គ្រាន់តែ Return
      return;
    }

    const date = new Date().toLocaleString('en-GB');
    
    const message = `
🔐 <b>Login Alert</b>
━━━━━━━━━━━━━━━
👤 User: <b>${email}</b>
🏷 Role: ${role.toUpperCase()}
🕒 Time: ${date}
🌐 IP: ${ip || 'Unknown'}
✅ Status: <b>Success</b>
━━━━━━━━━━━━━━━
    `;

    // ផ្ញើទៅ TELEGRAM_LOGIN_CHAT_ID
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_LOGIN_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('✅ Login Notification sent!');
  } catch (error) {
    console.error('❌ Failed to send Login Alert:', error.message);
  }
};

module.exports = { sendTelegramNotification, sendLoginNotification };