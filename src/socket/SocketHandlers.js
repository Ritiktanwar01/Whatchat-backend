const redis = require('../../config/redisConfig');
const { Verify_Access_Token_socket } = require('../middlewares/jwt');
const {
  saveOfflineMessage,
  findUnsentMessages,
} = require('../../utils/SaveOfflineMessages');
const Message = require('../../src/models/messages');

module.exports = function (io) {
  io.use((socket, next) => Verify_Access_Token_socket(socket, next));

  io.on('connection', async (socket) => {
    const user = socket.user.Sender;
    await redis.set(`user_socket:${user.email}`, socket.id);

    // ⏳ Delay unsent message delivery by 5 seconds
    setTimeout(async () => {
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
    }, 5000); // ⏱ 5-second delay

    // 📤 Handle outgoing messages
    socket.on('send_message', async ({ message, to }) => {
      const receiverSocketId = await redis.get(`user_socket:${to}`);
      const timestamp = Date.now();

      if (receiverSocketId) {
        try {
          io.to(receiverSocketId).emit('receive_message', {
            from: {
              email: user.email,
              name: user.name,
              mobile: user.mobile,
              profilePicture: user.profilePicture,
              timestamp,
            },
            message,
          });
        } catch (error) {
          console.error('Emit failed, saving offline:', error);
          await saveOfflineMessage(user._id, to, message);
        }
      } else {
        await saveOfflineMessage(user._id, to, message);
      }
    });

    socket.on('disconnect', async () => {
      await redis.del(`user_socket:${user.email}`);
    });
  });
};
