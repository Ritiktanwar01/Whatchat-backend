const dotenv = require('dotenv').config();
const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger')
const express = require('express');
const app = express();
const path = require("path")
const AuthRoutes = require("./src/routes/auth")
const port = process.env.PORT
const dbConn = require("./config/dbconfig")


dbConn()
app.use(corsConfig);
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public')));

app.use([AuthRoutes])


app.listen(port, () => {
    logger.info(`Chat app listening at http://localhost:${port}`);
});