//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Routing 
const homeRoutes = require('./routes/home');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const donationsRoutes = require('./routes/donations');
const galleryRoutes = require('./routes/gallery');
const missionsRoutes = require('./routes/missions');
const pastHistoryRoutes = require('./routes/past-history');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
// const router = require('./routes/home');
const forgetPassRoutes = require('./routes/forget-pass');
const newPassRoutes = require('./routes/new-pass');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// Calling Route Object
app.use(homeRoutes);
app.use(aboutRoutes);
app.use(contactRoutes);
app.use(donationsRoutes);
app.use(galleryRoutes);
app.use(missionsRoutes);
app.use(pastHistoryRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(forgetPassRoutes);
app.use(newPassRoutes);

app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

let random = Math.floor(Math.pow(Math.random(), 3) * 100000000);
// console.log(random);

mongoose.connect("mongodb://localhost:27017/hopegivers", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    address: String,
    dob: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);

        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));

// app.get("/", function (req, res) {
//   res.render("home");
// });

app.get("/auth/google",
    passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
    passport.authenticate('google', { failureRedirect: "/login" }),
    function (req, res) {
        // Successful authentication, redirect to secrets.
        res.redirect("/secrets");
    });

// app.get("/login", function (req, res) {
//   res.render("login");
// });

// app.get("/register", function (req, res) {
//   res.render("register");
// });

app.get("/secrets", function (req, res) {
    User.find({ "secret": { $ne: null } }, function (err, foundUsers) {
        if (err) {
            console.log(err);
        } else {
            if (foundUsers) {
                res.render("secrets", { usersWithSecrets: foundUsers });
            }
        }
    });
});

app.get("/donations", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("donations");
    } else {
        res.redirect("/login");
    }
});

// app.post("/submit", function (req, res) {
//     const submittedSecret = req.body.secret;

//     //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
//     // console.log(req.user.id);

//     User.findById(req.user.id, function (err, foundUser) {
//         if (err) {
//             console.log(err);
//         } else {
//             if (foundUser) {
//                 foundUser.secret = submittedSecret;
//                 foundUser.save(function () {
//                     res.redirect("/secrets");
//                 });
//             }
//         }
//     });
// });

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/register", function (req, res) {

    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        address: req.body.address,
        dob: req.body.dob,

    })

    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/donations");
            });
        }
    });

});

app.post("/login", function (req, res) {

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/donations");
            });
        }
    });

});







app.listen(5000, function () {
    console.log("Server started on port 5000.");
});
