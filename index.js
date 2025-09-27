const corsConfig = require('./config/corsConfig');
const logger = require('./config/logger')
const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT


app.use(corsConfig);
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(port, () => {
    logger.info(`Example app listening at http://localhost:${port}`);
});