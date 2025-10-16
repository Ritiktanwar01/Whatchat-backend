const jwt = require("jsonwebtoken")
const logger = require("../../config/logger")




const Get_Refresh_Token = ({ user }) => {
    try {
        const token = jwt.sign({ user }, process.env.REFRESH_TOKEN_SALT, { expiresIn: '7d' })
        return token
    } catch (error) {
    
        res.send({ status: 500, message: "something went wrong" })
    }
}


const Get_Access_Token = ({ refresh_token,username }) => {
    try {
        const token = jwt.sign({ refresh_token,username }, process.env.ACCESS_TOKEN_SALT, { expiresIn: '1d' })
        return token
    } catch (error) {
        res.send({ status: 500, message: "something went wrong" })
    }
}



const Verify_Access_Token = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.slice(7);

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SALT); 
    req.user = decode;
    next();
  } catch (error) {
    logger.error('Access token error:', error.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


const Verify_Access_Token_socket = (socket, next) => {
  const token = socket.handshake.auth.token;


  if (!token) {
   
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SALT);
    socket.user = decoded; // Attach user info to socket
    next(); // Allow connection
  } catch (error) {
    logger.error(error)
    return next(new Error('Authentication error: Invalid token'));
  }
};



const Verify_Refresh_Token = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed' });
        }

        const token = authHeader.slice(7)


        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SALT);

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};


module.exports = {
    Verify_Access_Token,
    Verify_Refresh_Token,
    Get_Access_Token,
    Get_Refresh_Token,
    Verify_Access_Token_socket
}



