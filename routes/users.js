const express = require("express");
const router = express.Router();
const {saveRedirectUrl} = require("../middleware.js");
const User = require("../models/user.js");
const passport = require("passport");
const userController = require("../controllers/users.js");
const wrapAsync = require("../utils/wrapAsync.js");

router
.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.signup));

router
.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true
}),userController.Afterlogin)

router.get("/logout",userController.logout);

module.exports = router;