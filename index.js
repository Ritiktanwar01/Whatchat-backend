const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger')
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require("path")
dotenv.config();
const AuthRoutes = require("./src/routes/auth")
const port = process.env.PORT


app.use(corsConfig);
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public')));

app.use([AuthRoutes])


app.listen(port, () => {
    logger.info(`Example app listening at http://localhost:${port}`);
});