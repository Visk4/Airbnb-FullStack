
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const { title } = require("process");
const { describe } = require("node:test");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const User = require("./models/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");
const dbURL = process.env.ATLASDB_URL;
const initData = require("./init/data.js");
const {initDB} = require("./init/index.js");

async function main() {
    await mongoose.connect(dbURL);
}
main().then(()=>{
    console.log("connected to db");
}).catch((err)=>{
    console.log(err);
})
initDB();
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl:dbURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
}) 

store.on("error",(err)=>{
    console.log("Error in mongo store",err);
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}


// app.get("/",(req,res)=>{
//     res.send("I am gRoot");
// })

app.use(session(sessionOptions));
app.use(flash());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.use((req,res,next)=>{
    res.locals.msg = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found"));
})

app.use((err,req,res,next)=>{
    let{statusCode = 500,message = "something went wrong"} = err;
    res.status(statusCode).render("./listings/error.ejs",{message});
})

app.listen(8080,(req,res)=>{
    console.log("listening to port 8080");
});
