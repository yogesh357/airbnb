const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {

        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser ,(err)=>{ // this login method will automatically login user when it is signed up
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup")
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

//here passport.authenticate() is middleware which is used to authecate before post route it takes input strstrgy and failureredirect

// (failureFlash:true) it is used to send flash msg  when authentication is failed
router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome back to WnaderLust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl); // passport can delete info in req.session.redirectUrl
});

router.get("/logout", (req, res, next) => {
    req.logOut((err) => {  //it is method provided by passport
        if (err) {
            return next(err);
        };
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
});


module.exports = router;