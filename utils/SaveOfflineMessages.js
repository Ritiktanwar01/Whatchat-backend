const Message = require('../src/models/messages');
const User = require('../src/models/auth');
const logger = require('../config/logger');


const FindReceipent = async (email) => {
  try {
    const user = await User.findOne({ email })
    if (user) {
      return { found: true, user }
    }
    return { found: false }
  } catch (error) {
    return { found: false, }
  }
}


// Save a new offline message
const saveOfflineMessage = async (sender, recipient, content) => {
  let recipient_id = await FindReceipent(recipient)

  if (recipient_id.found) {
    try {
      await Message.create({ sender, recipient:recipient_id.user.id, content });
      return { saved: true };
    } catch (error) {
      logger.error('Message save failed:', error);
      return { saved: false, error };
    }
  } else {
    // console.log("not working")
  }
};

// Find undelivered messages and mark them as delivered
const findUnsentMessages = async (user) => {
  try {
    const messages = await Message.find({ recipient: user._id, delivered: false }).populate('sender');
    if (messages.length === 0) return { found: true, messages: [] };

    const ids = messages.map(msg => msg._id);
    await Message.updateMany({ _id: { $in: ids } }, { delivered: true });

    return { found: true, messages };
  } catch (error) {
    logger.error('Find unsent messages failed:', error);
    return { found: false, messages: [], error };
  }
};


// delete deliverd messages after delivery
const deleteDeliveredMessages = async (user) => {
  try {
    const result = await Message.deleteMany({ recipient: user._id, delivered: true });
    return { deleted: true, found: true, count: result.deletedCount };
  } catch (error) {
    logger.error('Delete delivered messages failed:', error);
    return { deleted: false, found: false, error };
  }
};


module.exports = {
  saveOfflineMessage,
  findUnsentMessages,
  deleteDeliveredMessages,
};
