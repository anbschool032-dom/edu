// services/telegram.service.js

const axios = require('axios');
require('dotenv').config();

const { 
  TELEGRAM_BOT_TOKEN, 
  TELEGRAM_CREATE_USER_CHAT_ID, 
  TELEGRAM_LOGIN_CHAT_ID 
} = process.env;

// Helper Parse User Agent (ទុកដដែល)
const parseUserAgent = (userAgent) => {
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  let deviceType = 'Desktop'; 

  if (userAgent.includes('Windows')) os = 'Windows 10/11';
  else if (userAgent.includes('Mac')) os = 'MacOS';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
     os = 'iOS';
     deviceType = 'Mobile/Tablet';
  }
  else if (userAgent.includes('Linux')) os = 'Linux';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';

  if (userAgent.includes('Mobile')) deviceType = 'Mobile';

  return { os, browser, deviceType };
};

// ==========================================
// 1️⃣ Function: សម្រាប់ User ថ្មី (New User Alert) - FIXED GENDER & REDUNDANCY
// ==========================================
const sendTelegramNotification = async (data, creatorName) => {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CREATE_USER_CHAT_ID) {
      console.warn("⚠️ Telegram Token or Chat ID is missing for Create User");
      return;
    }

    const date = new Date().toLocaleDateString('en-GB');
    const fullName = `${data.first_name} ${data.last_name}`;
    const role = data.role_name ? data.role_name.toUpperCase() : 'UNKNOWN';
    
    // ✅ Check Gender (បើអត់មានដាក់ N/A)
    const genderDisplay = data.gender ? data.gender : 'N/A';

    let extraInfo = '';
    if (data.role_name === 'user') {
        extraInfo = `\n🏫 Institution: ${data.institution_name || '-'}\n🎓 Type: ${data.types_user || '-'}`;
    } else if (data.role_name === 'mentor') {
        extraInfo = `\n🏢 Company: ${data.company_name || '-'}\n💼 Job Title: ${data.job_title || '-'}\n🌟 Expertise: ${data.expertise_areas || '-'}`;
    } 
    // ❌ ដក Admin Phone ចេញពីទីនេះ (ព្រោះវាមាននៅខាងលើហើយ)
    // else if (data.role_name === 'admin') { ... }

    const message = `
🚀 <b>New User Created!</b>
━━━━━━━━━━━━━━━
📅 Date: ${date}
👤 Name: <b>${fullName}</b>
📧 Email: ${data.email}
📞 Phone: ${data.phone || '-'}
🚻 Gender: ${genderDisplay}
🏷 Role: <b>${role}</b>${extraInfo}
━━━━━━━━━━━━━━━
🛠 Created By: ${creatorName || 'System'}
    `;

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





// // ==========================================
// // 1️⃣ Function: សម្រាប់ User ថ្មី (New User Alert)
// // ==========================================
// const sendTelegramNotification = async (data, creatorName) => {
//   try {
//     if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CREATE_USER_CHAT_ID) {
//       console.warn("⚠️ Telegram Token or Chat ID is missing for Create User");
//       return;
//     }

//     const date = new Date().toLocaleDateString('en-GB');
//     const fullName = `${data.first_name} ${data.last_name}`;
//     const role = data.role_name ? data.role_name.toUpperCase() : 'UNKNOWN';
    
//     let extraInfo = '';
//     if (data.role_name === 'user') {
//         extraInfo = `\n🏫 Institution: ${data.institution_name || '-'}\n🎓 Type: ${data.types_user || '-'}`;
//     } else if (data.role_name === 'mentor') {
//         extraInfo = `\n🏢 Company: ${data.company_name || '-'}\n💼 Job Title: ${data.job_title || '-'}\n🌟 Expertise: ${data.expertise_areas || '-'}`;
//     } else if (data.role_name === 'admin') {
//         extraInfo = `\n📱 Admin Phone: ${data.phone || '-'}`;
//     }

//     const message = `
// 🚀 <b>New User Created!</b>
// ━━━━━━━━━━━━━━━
// 📅 Date: ${date}
// 👤 Name: <b>${fullName}</b>
// 📧 Email: ${data.email}
// 📞 Phone: ${data.phone || '-'}
// 🚻 Gender: ${data.gender || '-'}
// 🏷 Role: <b>${role}</b>${extraInfo}
// ━━━━━━━━━━━━━━━
// 🛠 Created By: ${creatorName || 'System'}
//     `;

//     await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
//       chat_id: TELEGRAM_CREATE_USER_CHAT_ID,
//       text: message,
//       parse_mode: 'HTML'
//     });
//     console.log('✅ Create User Notification sent!');
//   } catch (error) {
//     console.error('❌ Failed to send Telegram message:', error.message);
//   }
// };




// ==========================================
// 2️⃣ Function: សម្រាប់ Login (FIXED NAME & PHONE) 🔥
// ==========================================
const sendLoginNotification = async (user, req, token = '') => {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_LOGIN_CHAT_ID) return;

    // 1. IP & User Agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '::1';
    const userAgentString = req.headers['user-agent'] || 'Unknown';
    const { os, browser, deviceType } = parseUserAgent(userAgentString);

    // 2. Time Format
    const loginTime = new Date().toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Phnom_Penh', timeZoneName: 'short'
    });

    // 🔥 FIX STARTS HERE: Logic ចាប់យកឈ្មោះ និង Phone ឱ្យត្រូវ
    let fullName = 'Unknown';
    let phone = 'N/A';

    // ពិនិត្យមើលថា User នោះជា Admin, Mentor ឬ Student (AccUser)
    if (user.admin) {
        fullName = `${user.admin.first_name || ''} ${user.admin.last_name || ''}`;
        phone = user.admin.phone || 'N/A';
    } else if (user.mentor) {
        fullName = `${user.mentor.first_name || ''} ${user.mentor.last_name || ''}`;
        phone = user.mentor.phone || 'N/A';
    } else if (user.accUser) { // សម្រាប់ Student
        fullName = `${user.accUser.first_name || ''} ${user.accUser.last_name || ''}`;
        phone = user.accUser.phone || 'N/A';
    } else {
        // Fallback បើអត់មាន Relation
        fullName = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
        phone = user.phone || 'N/A';
    }
    // 🔥 FIX ENDS HERE

    const userRole = user.role_name ? user.role_name.toUpperCase() : 'USER';
    const userId = user.id || 'N/A';
    const sessionId = token ? token.slice(-5) : '...'; 

    // 3. Create Message
    const message = `
<b>ការជូនដំណឹងចូលប្រើប្រាស់ថ្មី / New Login Alert</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>អ្នកប្រើប្រាស់ / User:</b> ${fullName}
📧 <b>Email:</b> ${user.email}
🏷 <b>តួនាទី / Role:</b> ${userRole}
🏢 <b>សាខា / Branch:</b> Head Office
📞 <b>ទូរស័ព្ទ / Tel:</b> ${phone}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🕒 <b>ពេលវេលា / Login Time:</b>
${loginTime}

🌐 <b>អាសយដ្ឋាន IP / IP Address:</b>
<code>${ip}</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 <b>ព័ត៌មានឧបករណ៍ / Device Information:</b>

💻 <b>Platform:</b> ${os}
🌍 <b>Browser:</b> ${browser}
📱 <b>Device Type:</b> ${deviceType}
⚙️ <b>OS:</b> ${os}

<b>User Agent:</b>
<i>${userAgentString.substring(0, 50)}...</i>

━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ <b>Status:</b> Login successful!
🆔 <b>Session ID:</b> ${sessionId}
🆔 <b>User ID:</b> ${userId}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 <b>សេចក្តីជូនដំណឹង / Security Notice:</b>
If this wasn't you, please change your password immediately!
ប្រសិនបើមិនមែនជាអ្នក សូមប្តូរពាក្យសម្ងាត់របស់អ្នកភ្លាមៗ!
    `;

    // 4. Send to Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_LOGIN_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });
    console.log('✅ Login Notification sent with Full Details!');
  } catch (error) {
    console.error('❌ Failed to send Login Alert:', error.message);
  }
};

module.exports = { sendTelegramNotification, sendLoginNotification };