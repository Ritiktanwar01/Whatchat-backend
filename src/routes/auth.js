const express = require("express")
const router = express.Router()
const { Login, Signup,Refresh } = require("../controllers/authcontrolers")
const {Verify_Refresh_Token} = require("../middlewares/jwt")



router.post('/login', Login)
router.post('/signup', Signup)
router.post('/refresh',Verify_Refresh_Token,Refresh)


module.exports = router