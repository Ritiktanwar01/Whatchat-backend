const User = require("../models/auth")
const bcrypt = require("bcrypt")
const { Get_Refresh_Token, Get_Access_Token } = require("../middlewares/jwt")


let Login = async (req, res) => {
  try {
    
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const Refresh_token = Get_Refresh_Token(user.username)

    const Access_token = Get_Access_Token(user.username)

    res.status(200).send({ status: 200, Refresh_token,Access_token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ message: 'Login failed', error });
  }
};


let Signup = async (req, res) => {
    try {
        const { username, password } = req.body;

        const newUser = await User.create({ username, password });

        res.status(200).send({ status: 201, user: newUser });

    } catch (error) {
        res.send({ status: 500, message: "Something went wrong" })
    }
}


const Refresh = async (req, res) => {
    try {
        // if user had a valid refresh token then we will issue a new access token to him so first we
        // we will verify refresh token then we are going to issue a new access token
    } catch (error) {

    }
}


module.exports = {
    Login,
    Signup,
    Refresh
}