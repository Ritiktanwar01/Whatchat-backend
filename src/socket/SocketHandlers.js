const redis = require('../../config/redisConfig');
const { Verify_Access_Token_socket } = require('../middlewares/jwt');
const {
  saveOfflineMessage,
  findUnsentMessages,
} = require('../../utils/SaveOfflineMessages');
const Message = require('../../src/models/messages');
const User = require('../models/auth');
const { sendNotification } = require("../notifications/SendNotifications");

module.exports = function (io) {
  io.use((socket, next) => Verify_Access_Token_socket(socket, next));

  io.on('connection', async (socket) => {
    const user = socket.user.Sender;
    socket.readyForMessages = false; 
    await redis.set(`user_socket:${user.email}`, socket.id);

    const userDoc = await User.findOne({ email: user.email });
    const friendEmails = userDoc?.friends || [];

   
    for (const friendEmail of friendEmails) {
      const friendDoc = await User.findOne({ email: friendEmail });
      const isMutual = friendDoc?.friends?.includes(user.email);

      if (isMutual) {
        const friendSocketId = await redis.get(`user_socket:${friendEmail}`);
        if (friendSocketId) {
          io.to(friendSocketId).emit('friend_online', { email: user.email });
        }
      }
    }


    socket.on('client_ready', async () => {
      socket.readyForMessages = true;

      const { found, messages } = await findUnsentMessages(user);
      const deliveredIds = [];

      if (found && messages.length > 0) {
        for (const msg of messages) {
          try {
            socket.emit('receive_message', {
              from: {
                email: msg.sender.email,
                name: msg.sender.name,
                mobile: msg.sender.mobile,
                profilePicture: msg.sender.profilePicture,
                timestamp: msg.timestamp.getTime(),
              },
              message: msg.content,
            });
            deliveredIds.push(msg._id);
          } catch (error) {
            console.error('Failed to deliver message:', msg._id, error);
          }
        }

        if (deliveredIds.length > 0) {
          await Message.deleteMany({ _id: { $in: deliveredIds } });
        }
      }
    });

  
    socket.on('send_message', async ({ message, to }) => {
      const receiverSocketId = await redis.get(`user_socket:${to}`);
      const timestamp = Date.now();

      await Promise.all([
        User.updateOne({ email: user.email }, { $addToSet: { friends: to } }),
        User.updateOne({ email: to }, { $addToSet: { friends: user.email } })
      ]);

      if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket?.readyForMessages) {
          receiverSocket.emit('receive_message', {
            from: {
              email: user.email,
              name: user.name,
              mobile: user.mobile,
              profilePicture: user.profilePicture,
              timestamp,
            },
            message,
          });
        } else {
          await saveOfflineMessage(user._id, to, message);
        }
      } else {
        await saveOfflineMessage(user._id, to, message);

        try {
          const [senderDoc, receiverDoc] = await Promise.all([
            User.findOne({ email: user.email }),
            User.findOne({ email: to }),
          ]);

          const deviceToken = receiverDoc?.fcmToken;
          if (deviceToken) {
            const title = message;
            const body = `You have some messages`;
            const imageUrl = `https://yourdomain.com${senderDoc?.profilePicture || ''}`;

            await sendNotification(deviceToken, title, body, imageUrl);
          }
        } catch (error) {
          console.error('Notification failed:', error);
        }
      }
    });

   
    socket.on('get_active_friends', async ({ friendEmails }) => {
      const pipeline = redis.multi();
      friendEmails.forEach(email => pipeline.get(`user_socket:${email}`));
      const results = await pipeline.exec();
      const active = friendEmails.filter((_, i) => results[i][1]);
      socket.emit('active_friends_list', { active });
    });


    socket.on('disconnect', async () => {
      await redis.del(`user_socket:${user.email}`);

      for (const friendEmail of friendEmails) {
        const friendDoc = await User.findOne({ email: friendEmail });
        const isMutual = friendDoc?.friends?.includes(user.email);

        if (isMutual) {
          const friendSocketId = await redis.get(`user_socket:${friendEmail}`);
          if (friendSocketId) {
            io.to(friendSocketId).emit('friend_offline', { email: user.email });
          }
        }
      }
    });
  });
};
