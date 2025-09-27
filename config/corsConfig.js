const cors = require('cors');

const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN, // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

module.exports = cors(corsOptions);