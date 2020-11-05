require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require('md5');
const session = require('express-session');
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");
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

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

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

const missionSchema = new mongoose.Schema({
    Image: String,
    title: String,
    content: String,

});

const User = new mongoose.model('User', userSchema);
const Mission = new mongoose.model('Mission', missionSchema);

var obj = new Object();

app.post("/register", function (req, res) {

    const newUser = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        address: req.body.address,
        dob: req.body.dob,
        password: md5(req.body.password)

    })

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('donations');
        }
    });

});

app.post("/login", function (req, res) {

    const email = req.body.email;
    const password = md5(req.body.password);
    req.session.email = email;

    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    let admin_email = process.env.ADMIN_EMAIL;
                    if (foundUser.email === admin_email) {
                        // app.use(function(req, res, next) {
                        //   res.locals.email = req.session.email;
                        //   next();
                        // });
                        res.render('about', { Admin_email: admin_email });
                        console.log(req.session.email);
                    }
                    else {
                        res.redirect('donations');
                    }
                }
                else {
                    console.log('Wrong password');
                }
            }
        }
    })
});

app.post("/forget-pass", function (req, res) {

    let email = req.body.email;
    let admin_email = process.env.ADMIN_EMAIL;
    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {

                const msg = {
                    to: email, // Change to your recipient
                    from: admin_email, // Change to your verified sender
                    subject: 'Email Verification for Password Retrieval;',
                    text: 'Team Hopegivers',
                    html: '<strong>Click on the link given below to change your password</strong><br><p>http://localhost:3000/new-pass/' + random + '</p>',
                }
                sgMail
                    .send(msg)
                    .then(() => {
                        console.log('Email sent')
                    })
                    .catch((error) => {
                        console.error(error)
                    })

                obj.email_id = email;
                obj.random_no = random;


                res.render('email-sent');
            }
            else {
                console.log("No Such User");
            }
        }
    })
});



app.get("/new-pass/:random", function (req, res) {
    let random_forgot_pass = req.params.random;
    // console.log(obj);
    if (obj.random_no == random_forgot_pass) {
        console.log(random);
        res.redirect("/new-pass");
    }
    else {
        res.redirect("/");
    }
})

app.post("/new-pass", function (req, res) {
    let new_password = md5(req.body.password);
    if (obj.email_id) {
        let password_is_same = User.findOne({ email: obj.email_id }, { password: new_password });
        if (password_is_same) {
            console.log('Password same hai bhai');
            res.render('new-pass', { Password_Same: password_is_same });
        }
        else {
            User.updateOne({ email: obj.email_id }, { password: new_password }, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.redirect('/login');
                }
            }
            )
        }
    }

})

app.get("/donations", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit");
    } else {
        res.redirect("/login");
    }

});

// rs


app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

app.get(function (req, res, next) {

});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
