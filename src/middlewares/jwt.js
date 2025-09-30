const jwt = require("jsonwebtoken")
require('dotenv').config();




const Get_Refresh_Token = ({ user }) => {
    try {
        const token = jwt.sign({ user }, process.env.REFRESH_TOKEN_SALT, { expiresIn: '7d' })
        return token
    } catch (error) {
        res.send({ status: 500, message: "something went wrong" })
    }
}


const Get_Access_Token = ({ refresh_token }) => {
    try {
        const token = jwt.sign({ refresh_token }, process.env.ACCESS_TOKEN_SALT, { expiresIn: '1d' })
        return token
    } catch (error) {
        res.send({ status: 500, message: "something went wrong" })
    }
}



const Verify_Access_Token = ({ token, req, res, next }) => {
    try {
        const decode = jwt.decode(token, process.env.ACCESS_TOKEN_SALT)
        req.user = decode
        next()
    } catch (error) {
       res.status(401).json({ message: 'Invalid or expired token' });
    }
}


const Verify_Refresh_Token = ({ token, req, res, next }) => {
    try {
        const decode = jwt.sign({ user }, process.env.REFRESH_TOKEN_SALT, { expiresIn: '1d' })
        req.user = decode
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = {
    Verify_Access_Token,
    Verify_Refresh_Token,
    Get_Access_Token,
    Get_Refresh_Token
}



