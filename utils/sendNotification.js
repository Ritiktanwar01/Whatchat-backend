const admin = require('../config/firebase');

async function sendPushNotification({ token, title, body, data = {} }) {
  const message = {
    token,
    notification: { title, body },
    data,
  };

  try {
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (error) {
    console.error('FCM Error:', error);
    return { success: false, error };
  }
}

module.exports = sendPushNotification;