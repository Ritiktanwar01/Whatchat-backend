const redis = require("../config/redisConfig");
const logger = require("../config/logger")
const nodemailer = require('nodemailer');

function SendMailAuth(user,OTP) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.SMTP_MAIL}`,
        pass: `${process.env.SMTP_PASS}`,
      },
    });

    const mailOptions = {
      from: `${process.env.SMTP_MAIL}`,
      to: user,
      subject: 'Zappchat verification code',
      text: `Your OTP for Zappchat login is ${OTP}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error:', error);
      } else {
        logger.info('Email sent:', info.response);
      }
    });
  } catch (error) {
    logger.error(error)
  }
}

module.exports = class OTP {
    async setOTP(otp, user) {
        try {
            SendMailAuth(user,otp)
            await redis.set(`user_otp:${user}`, otp, "EX", 600);
            return true
        } catch (error) {
            logger.error(error)
            console.log(error)
            return false
        }
    }

    async getOTP(user) {
        try {
            const otp = await redis.get(`user_otp:${user}`)
            return {otp:otp,found:true}
        } catch (error) {
            return {found:false}
        }
    }

    async remove(user) {
        try {
            const otp = await redis.del(`user_otp:${user}`)
            return {otp:otp,found:true}
        } catch (error) {
            return {found:false}
        }
    }
}
