const express = require("express")
const router = express.Router()
const { Signup,Refresh,SendOTP,verifyOTP,SetMobile,SearchUser } = require("../controllers/authcontrolers")
const {Verify_Refresh_Token,Verify_Access_Token} = require("../middlewares/jwt")



// router.post('/login', Login)
router.post('/signup', Signup)
router.post('/refresh',Verify_Refresh_Token,Refresh)
router.post("/SendOtp",SendOTP)
router.post("/login",verifyOTP)
router.post("/SetMobile",Verify_Access_Token,SetMobile)
router.post("/searchfriend",SearchUser)


module.exports = router