const redis = require("../../config/redisConfig")
const Users = require("../models/auth")
const {Verify_Access_Token} = require("../middlewares/jwt")



module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('chat_message', (msg) => {
      console.log('Message:', msg);
      io.emit('recieve', msg);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
