const nodemailer = require('nodemailer');
const logger = require('./logger')

module.exports = function SendMailAuth(user,OTP) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: `${process.env.SMTP_MAIL}`,
        pass: `${process.env.SMTP_PASS}`,
      },
    });

    const mailOptions = {
      from: 'tanwarritik999@gmail.com',
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
