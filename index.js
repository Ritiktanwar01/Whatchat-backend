// node modules imports
require('dotenv').config({debug:true});
const express = require('express');

// server configuration imports
const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger')
const {app,server,io} = require("./config/SocketConfig")
const path = require("path")
const port = process.env.PORT
const dbConn = require("./config/dbconfig")
const redis = require("./config/redisConfig")
const {sendNotification} = require("./src/notifications/SendNotifications")

// importing routes

const AuthRoutes = require("./src/routes/auth")


// connect with database

dbConn()


// Applying middlewares
app.use(corsConfig);
app.use(express.json());
app.use('/media/uploads', express.static(path.join(__dirname, 'public/uploads')));


// setting up the routes
app.use([AuthRoutes])

// handling socket io events in seprate file for better modularity

require("./src/socket/SocketHandlers")(io);

const cleanupRedis = async () => {
  try {
    console.log('Flushing Redis before shutdown...');
    await redis.flushdb(); // or flushall() if you're using multiple DBs
    console.log('Redis flushed successfully.');
  } catch (err) {
    console.error('Error flushing Redis:', err);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await cleanupRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupRedis();
  process.exit(0);
});

// (async () => {
//   await sendNotification(
//     'ds9_FUvwR_WEznaSghYLg8:APA91bFecBrAF0t2O_AX4mAGdkojc0otB1EKWrqVBrhEwSX949qTopcnCTvIReMKVGFI3ib7c9PfcFTbCfV8TvaSF8vcbq58T1geozNx5WsTA9lLdaNNj3s',
//     'Hello from Postman',
//     'This is a v1 API test',
//     'https://th.bing.com/th/id/R.2daa9423aaf624990eabf5bc5452dbd4?rik=24XvlZdo7H0hFQ&riu=http%3a%2f%2fsearchengineland.com%2ffigz%2fwp-content%2fseloads%2f2015%2f12%2fgoogle-amp-fast-speed-travel-ss-1920.jpg&ehk=Cv2SH3NafTzQ7OIM8u5Xt2tQb2WPid62XjfInAwYxcY%3d&risl=&pid=ImgRaw&r=0'
//   );
// })();

// logging server starts
server.listen(port, () => {
    logger.info(`Chat app listening at http://localhost:${port}`);
});

