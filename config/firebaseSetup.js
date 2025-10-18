const admin = require('firebase-admin');
const serviceAccount = require("./zappchat-ddf60-firebase-adminsdk-fbsvc-6604b52627.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
