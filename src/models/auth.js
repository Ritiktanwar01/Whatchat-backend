const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: false,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: 'http://97.74.90.82:5500/media/uploads/profile/people.png'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
