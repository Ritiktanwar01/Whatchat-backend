const router = require("express").Router()
const {SendFriendRequest} = require("../controllers/friendsControlers")
const {Verify_Access_Token} = require("../middlewares/jwt")



router.post('/send_request',Verify_Access_Token,SendFriendRequest)





module.exports = router