const admin = require('../../config/firebaseSetup');
const logger = require('../../config/logger');

const sendNotification = async (deviceToken, title, body, imageUrl = '') => {
  const message = {
    token: deviceToken,
    notification: {
      title,
      body,
      image: imageUrl, 
    },
    android: {
      priority: 'high',
      ttl: 86400 * 1000, // 1 day
      notification: {
        imageUrl, 
      },
    },
    apns: {
      headers: {
        'apns-priority': '10',
      },
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: 'default',
          'mutable-content': 1, 
        },
        fcm_options: {
          image: imageUrl, 
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log(response)
    logger.log('Notification sent:', response);
  } catch (error) {
    console.log(error)
    logger.error('Error sending notification:', error);
  }
};

module.exports={sendNotification}
