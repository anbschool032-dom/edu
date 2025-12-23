// // services/telegram.service.js
// const axios = require('axios');

// // ✅ Token របស់បង
// const TELEGRAM_BOT_TOKEN = '7848919514:AAFkvooGHcUThFOyJ92CtOJFrkw-h6KO6pY'; 

// // ✅ នេះជា ID របស់ Group "New Customer (Carr)" (បានពី JSON របស់បង)
// const TELEGRAM_CHAT_ID = '-5027081627'; 

// const sendTelegramNotification = async (data, creatorName) => {
//   try {
//     const date = new Date().toLocaleDateString('en-GB');
    
//     // ✅ កែត្រង់នេះ (ដាក់ Backticks ` ` ជំនួស ' ')
//     const fullName = `${data.first_name} ${data.last_name}`; 
//     const role = data.role_name ? data.role_name.toUpperCase() : 'UNKNOWN';
    
//     let extraInfo = '';

//     if (data.role_name === 'user') {
//         extraInfo = `
// 🏫 Institution: ${data.institution_name || '-'}
// 🎓 Type: ${data.types_user || '-'}
//         `;
//     } else if (data.role_name === 'mentor') {
//         extraInfo = `
// 🏢 Company: ${data.company_name || '-'}
// 💼 Job Title: ${data.job_title || '-'}
// 🌟 Expertise: ${data.expertise_areas || '-'}
//         `;
//     } else if (data.role_name === 'admin') {
//         extraInfo = `
// 📱 Admin Phone: ${data.phone || '-'}
//         `;
//     }

//     // ✅ កែត្រង់នេះ (ប្រើ Backticks)
//     const message = `
// 🚀 <b>New User Created!</b>
// ━━━━━━━━━━━━━━━
// 📅 Date: ${date}
// 👤 Name: <b>${fullName}</b>
// 📧 Email: ${data.email}
// 📞 Phone: ${data.phone || '-'}
// 🚻 Gender: ${data.gender || '-'}
// 🏷 Role: <b>${role}</b>
// ${extraInfo}
// ━━━━━━━━━━━━━━━
// 🛠 Created By: ${creatorName || 'System'}
//     `;

//     // ✅ កែត្រង់នេះ (ប្រើ Backticks សម្រាប់ URL)
//     const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
//     await axios.post(url, {
//       chat_id: TELEGRAM_CHAT_ID,
//       text: message,
//       parse_mode: 'HTML'
//     });

//     console.log('✅ Telegram notification sent!');
//   } catch (error) {
//     console.error('❌ Failed to send Telegram message:', error.message);
//   }
// };

// module.exports = { sendTelegramNotification };



// services/telegram.service.js
const axios = require('axios');

// ✅ ប្រើ Token ដដែល (Bot តែមួយ)
const TELEGRAM_BOT_TOKEN = '7848919514:AAFkvooGHcUThFOyJ92CtOJFrkw-h6KO6pY'; 

// 1. Group សម្រាប់ User ថ្មី ("New Customer (Carr)")
const TELEGRAM_CREATE_USER_CHAT_ID = '-5027081627'; 

// 2. Group សម្រាប់ Login ("User Login") - ✅ ដាក់លេខ ID ថ្មីដែលខ្ញុំឃើញក្នុងរូបបង
const TELEGRAM_LOGIN_CHAT_ID = '-5048199078'; 

// Function 1: សម្រាប់ User ថ្មី (ផ្ញើទៅ Group ទី ១)
const sendTelegramNotification = async (data, creatorName) => {
  try {
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
      chat_id: TELEGRAM_CREATE_USER_CHAT_ID, // 👈 Group ទី ១ (New Customer)
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
      chat_id: TELEGRAM_LOGIN_CHAT_ID, // 👈 Group ទី ២ (User Login)
      text: message,
      parse_mode: 'HTML'
    });
    console.log('✅ Login Notification sent!');
  } catch (error) {
    console.error('❌ Failed to send Login Alert:', error.message);
  }
};

module.exports = { sendTelegramNotification, sendLoginNotification };