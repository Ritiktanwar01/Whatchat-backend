const redis = require("../../config/redisConfig");
const { Verify_Access_Token_socket } = require("../middlewares/jwt");
const logger = require("../../config/logger")

module.exports = function (io) {
  io.use((socket, next) => Verify_Access_Token_socket(socket, next));

  io.on('connection', async (socket) => {
    await redis.set(`user_socket:${socket.user.username}`, socket.id);
    logger.log(`✅ Connected: ${socket.user.username} (${socket.id})`);

    socket.on('send_message', async ({ message, to }) => {
      const sender = socket.user;
      const receiverSocketId = await redis.get(`user_socket:${to}`);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          from: {
            email: sender.username,
            name: sender.name,
            mobile: sender.mobile,
            profilePicture: sender.profilePicture,
          },
          message,
        });
      } else {
        logger.log(`📭 User ${to} is not connected`);
      }
    });

    socket.on('disconnect', async () => {
      await redis.del(`user_socket:${socket.user.username}`);
      logger.log(`❌ Disconnected: ${socket.user.username}`);
    });
  });
};
