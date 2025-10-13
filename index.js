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
const SendMailAuth = require("./config/mailauth")

// importing routes

const AuthRoutes = require("./src/routes/auth")


// connect with database

dbConn()


// Applying middlewares
app.use(corsConfig);
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public')));


// setting up the routes
app.use([AuthRoutes])

// handling socket io events in seprate file for better modularity

require("./src/socket/SocketHandlers")(io);



// logging server starts
server.listen(port, () => {
    logger.info(`Chat app listening at http://localhost:${port}`);
});