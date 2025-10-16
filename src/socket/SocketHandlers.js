const redis = require("../../config/redisConfig");
const { Verify_Access_Token_socket } = require("../middlewares/jwt");

module.exports = function (io) {
  io.use((socket, next) => Verify_Access_Token_socket(socket, next));

  io.on('connection', async (socket) => {
    await redis.set(`user_socket:${socket.user.username}`, socket.id);
    console.log(`✅ Connected: ${socket.user.username} (${socket.id})`);

    socket.on('send_message', async ({ message, to }) => {
      const sender = socket.user;
      const receiverSocketId = await redis.get(`user_socket:${to}`);
      console.log("ran")
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
        console.log(`📭 User ${to} is not connected`);
      }
    });

    socket.on('disconnect', async () => {
      await redis.del(`user_socket:${socket.user.username}`);
      console.log(`❌ Disconnected: ${socket.user.username}`);
    });
  });
};
