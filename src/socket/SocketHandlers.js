const redis = require("../../config/redisConfig");
const { Verify_Access_Token_socket } = require("../middlewares/jwt");

module.exports = function (io) {
  io.use((socket, next) => Verify_Access_Token_socket(socket, next));

  io.on('connection', async (socket) => {
    await redis.set(`user_socket:${socket.user.username}`, socket.id);
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.on('send_message', async ({ message, to }) => {
      const senderId = socket.user?.user;
      console.log(message, to)
      const receiverSocketId = await redis.get(`user_socket:${to}`);
      console.log(receiverSocketId)

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          from: senderId,
          message
        });
      } else {
        console.log(`📭 User ${to} is not connected`);
      }
    });

    socket.on('disconnect', async () => {
      await redis.del(`user_socket:${socket.user.username}`);
    });
  });
};
