const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // This package helps us to use multiple  ejs templets(used for boilerplate which are in commen) 
const ExpressError = require("./utils/ExprssError.js");
const session = require("express-session");
const flash = require("connect-flash");

//For using express router
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

//For authontaction----------->
const passport= require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");

 
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
};
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
 
const sessionOptions ={
    secret :"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7*24*60*60*1000,
        httpOnly:true,
    }
};

app.get("/", (req, res) => {
    res.send("hi ! I am root");
    
});


app.use(session(sessionOptions));
app.use(flash());

// AUTHONTICATION ==================>

//by this passport will be initilizsd for every rout
app.use(passport.initialize());
//We are using passport session to prevent login again and again in diff routes
app.use(passport.session());
//To authenticate user:
passport.use(new LocalStrategy(User.authenticate()));

//for serialize(storing info related to user in session) and deserialize(deliting info related to user in session)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this is middleware defined to access local veriables
app.use((req,res,next)=>{
    res.locals.success = req.flash("success"); 
    res.locals.error = req.flash("error"); 
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"sstudent@gmail.com",
//         username:"delta-student",
//     });

//     let registeredUser =  await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

app.use("/listings" , listingsRouter); 
 
//ROUTES for Reviews+++++++++++++++++++++>
app.use("/listings/:id/reviews" , reviewsRouter); // Here /listings/:id/reviews" is parents route

app.use("/",userRouter);
 
//This rout execute for all listings==========>
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

//Error handeler middleware===========>
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something is getting wrong" } = err;
    //    res.status(statusCode).send(message);
    res.render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Servers is running at port 8080");
});



 