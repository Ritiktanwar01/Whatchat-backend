const express = require("express")
const router = express.Router()
const upload = require('../../config/MulterConfig');
const { Refresh,SendOTP,verifyOTP,SetMobile,SearchUser,FCM_Update,UpdateProfilePicture,Get_User_Profile_Pic } = require("../controllers/authcontrolers")
const {Verify_Refresh_Token,Verify_Access_Token} = require("../middlewares/jwt")



// router.post('/login', Login)
// router.post('/signup', Signup)
router.post('/refresh',Verify_Refresh_Token,Refresh)
router.post("/SendOtp",SendOTP)
router.post("/login",verifyOTP)
router.post("/SetMobile",Verify_Access_Token,SetMobile)
router.post("/searchfriend",Verify_Access_Token,SearchUser)
router.post('/fcm-token', Verify_Access_Token,FCM_Update)
router.put('/updatePic',Verify_Access_Token,upload.single('image'),UpdateProfilePicture);
router.get('/Get_User_Profile_Pic',Verify_Access_Token,Get_User_Profile_Pic)



module.exports = router