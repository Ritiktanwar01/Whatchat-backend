const User = require("../models/auth")
const bcrypt = require("bcrypt")
const { Get_Refresh_Token, Get_Access_Token } = require("../middlewares/jwt")
const logger = require("../../config/logger")
const OTPService = require("../../utils/OTPService")
const { generateOTP } = require("../../utils/GenarateOtp")


// let Login = async (req, res) => {
//   try {

//     const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;

//     logger.info(`login attempt by ${ip}`)

//     const { username, password } = req.body;

//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.status(401).send({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).send({ message: 'Invalid credentials' });
//     }

//     const Refresh_token = Get_Refresh_Token({ user: { username: username, user_id: user.id } })

//     const Access_token = Get_Access_Token({ refresh_token: Refresh_token, username: username })

//     res.status(200).send({ status: 200, Refresh_token, Access_token });

//   } catch (error) {
//     logger.error(error)
//     res.status(500).send({ message: 'Login failed', error });
//   }
// };


let Signup = async (req, res) => {

  try {

    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;

    logger.info(`Signup attempt by ${ip}`)

    const { username, password, mobile } = req.body;

    const newUser = await User.create({ username, password, mobile });

    newUser.save()

    const Refresh_token = Get_Refresh_Token({ user: { username: username, user_id: newUser.id } })

    const Access_token = Get_Access_Token({ refresh_token: Refresh_token, username: username })

    res.status(200).send({ status: 201, Refresh_token, Access_token });

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

      const Refresh_token = Get_Refresh_Token({ user: { username: username, user_id: user.id } })

      const Access_token = Get_Access_Token({ refresh_token: Refresh_token, username: username })

      return res.status(200).send({ status: 200, Refresh_token, Access_token })
    }

    return res.status(401).send({ status: 401, message: "Invalid refresh token" })
  } catch (error) {
    logger.error(error)
    return res.status(500).send({ message: "Something went wrong" })
  }
};

const SendOTP = async (req, res) => {
  try {

    const { email } = req.body

    const otp = new OTPService()

    const OTPVal = generateOTP()

    await otp.setOTP(OTPVal, email)

    res.status(200).send({ message: "otp sent to email", status: 200 })

  } catch (error) {
    logger.error(error)
    res.status(500).send({ message: "something went wrong" })
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { email, OTP } = req.body;
    const otpService = new OTPService();
    const { found, otp } = await otpService.getOTP(email);

    if (!found) {
      return res.status(400).send({ message: "OTP has expired, please request a new one" });
    }

    if (OTP !== otp) {
      return res.status(401).send({ message: "Invalid OTP" });
    }

    await otpService.remove(email);

    let user = await User.findOne({ email });

    const wasNew = !user;

    if (wasNew) {
      user = await User.create({ email });
    }

    const Refresh_token = Get_Refresh_Token({
      user: { username: email, user_id: user.id },
    });

    const Access_token = Get_Access_Token({
      refresh_token: Refresh_token,
      username: email,
    });

    const responsePayload = {
      Refresh_token,
      Access_token,
      message: wasNew ? "Signup success" : "Login success",
      login: true,
    };

    if (user.mobile) {
      responsePayload.mobile = user.mobile;
    }

    return res.send(responsePayload);
  } catch (error) {
    logger.error(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
};





const SetMobile = async (req, res) => {
  try {

    const { mobile } = req.body
    const { username } = req.user

    const updateUser = await User.updateOne({ email: username }, { $set: { mobile } })


    res.status(200).send({ message: "updated successfully", success: true })

  } catch (error) {
    logger.error(error)
    res.status(500).send({ message: "something went wrong" })
  }
}

const SearchUser = async (req, res) => {
  try {
    const { contactList } = req.body

    const registeredUsers = await User.find({
      mobile: { $in: contactList }
    }, { profilePicture: 1, _id: 0, email: 1, mobile: 1 })



    res.status(200).send({ friendId: registeredUsers })
  } catch (error) {
    logger.error(error)
    res.status(500).send({ message: "something went wrong" })
  }
}



module.exports = {
  // Login,
  Signup,
  Refresh,
  SendOTP,
  verifyOTP,
  SetMobile,
  SearchUser
}