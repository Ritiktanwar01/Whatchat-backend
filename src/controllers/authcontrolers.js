const User = require("../models/auth")
const bcrypt = require("bcrypt")
const { Get_Refresh_Token, Get_Access_Token } = require("../middlewares/jwt")
const logger = require("../../config/logger")


let Login = async (req, res) => {
  try {

    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;

    logger.info(`login attempt by ${ip}`)

    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const Refresh_token = Get_Refresh_Token({ user: { username: username, user_id: user.id } })

    const Access_token = Get_Access_Token(Refresh_token)

    res.status(200).send({ status: 200, Refresh_token, Access_token });

  } catch (error) {
    logger.error(error)
    res.status(500).send({ message: 'Login failed', error });
  }
};


let Signup = async (req, res) => {

  try {

    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;

    logger.info(`Signup attempt by ${ip}`)

    const { username, password } = req.body;

    const newUser = await User.create({ username, password });

    res.status(200).send({ status: 201, user: newUser });

  } catch (error) {
    logger.error(error)
    res.send({ "status": 500, message: "Something went wrong" })
  }
}


const Refresh = async (req, res) => {
  try {

    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;

    logger.info(`token refresh request attempt by ${ip}`)

    const { username, user_id } = req.user.user;

    const user = await User.findOne({ username });

    if (user) {
      const Refresh_token = Get_Refresh_Token({ user: { username, user_id } });
      const Access_token = Get_Access_Token(Refresh_token);

      return res.status(200).send({ status: 200, Refresh_token, Access_token })
    }

    return res.status(401).send({ status: 401, message: "Invalid refresh token" })
  } catch (error) {
    logger.error(error)
    return res.status(500).send({ message: "Something went wrong" })
  }
};



module.exports = {
  Login,
  Signup,
  Refresh
}