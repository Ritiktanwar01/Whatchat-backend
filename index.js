const dotenv = require('dotenv').config();
const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger')
const express = require('express');
const app = express();
const path = require("path")
const port = process.env.PORT
const dbConn = require("./config/dbconfig")

// importing routes

const AuthRoutes = require("./src/routes/auth")
const FriendsRoutes = require("./src/routes/friendsroutes")


// Applying middlewares

dbConn()
app.use(corsConfig);
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public')));


// setting up the routes
app.use([AuthRoutes,FriendsRoutes])


app.listen(port, () => {
    logger.info(`Chat app listening at http://localhost:${port}`);
});