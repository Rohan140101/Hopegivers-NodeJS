require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require('md5');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const stripe = require('stripe')(process.env.STRIPE_SECRET_API);
const cookieParser = require('cookie-parser');

// Routing 
// const homeRoutes = require('./routes/home');
// const aboutRoutes = require('./routes/about');
// const contactRoutes = require('./routes/contact');
// const donationsRoutes = require('./routes/donations');
// const galleryRoutes = require('./routes/gallery');
// const missionsRoutes = require('./routes/missions');
const pastHistoryRoutes = require('./routes/past-history');
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const forgetPassRoutes = require('./routes/forget-pass');
const newPassRoutes = require('./routes/new-pass');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// Calling Route Object
// app.use(homeRoutes);
// app.use(aboutRoutes);
// app.use(contactRoutes);
// app.use(donationsRoutes);
// app.use(galleryRoutes);
// app.use(missionsRoutes);
app.use(pastHistoryRoutes);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(forgetPassRoutes);
app.use(newPassRoutes);

app.use(cookieParser());

app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }));

let random = Math.floor(Math.pow(Math.random(), 3) * 100000000);
// console.log(random);
let amount = 0, message;

var url = process.env.MONGOD_API;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

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

const moneyDonateSchema = new mongoose.Schema({
    email: String,
    amount: Number,
    message: String,
    date: String
})

const clothDonateSchema = new mongoose.Schema({
    email: String,
    cloth_type: String,
    cloth_gender: String,
    message: String,
    date: String
})

const User = new mongoose.model('User', userSchema);
const Mission = new mongoose.model('Mission', missionSchema);
const MoneyDonate = new mongoose.model('Money_donate', moneyDonateSchema, 'money_donate');
const ClothDonate = new mongoose.model('Cloth_donate', clothDonateSchema, 'cloth_donate');

var obj = new Object();
let userLogin = false;
let publisher_key = process.env.STRIPE_PUBLISHER_API;
let secret_key = process.env.STRIPE_SECRET_API;

today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
var stringDate = dd + "-" + mm + "-" + yyyy;

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

    res.cookie("userLogin", email);

    // console.log(req.cookies);

    User.findOne({ email: email }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    let admin_email = process.env.ADMIN_EMAIL;
                    if (foundUser.email === admin_email) {
                        // userLogin = email;
                        res.redirect('/about');
                    }
                    else {

                        res.redirect('/donations');

                    }
                }
                else {
                    res.redirect('/login');
                    console.log('Wrong password');
                }
            }
        }
    })
});


app.get('/donations', function (req, res) {
    userLogin = req.cookies.userLogin;
    // app.locals.Login = userLogin;
    if (userLogin) {
        res.render('donations', { myAccount: userLogin, key: publisher_key });
        console.log(userLogin);
    }
    else {
        res.redirect('login');
    }
});

app.post('/donations', async (req, res, next) => {
    // TO ADD: data validation, storing errors in an `errors` variable!
    // const name = req.body.name;
    // const email = req.body.email;
    amount = req.body.amount;
    message = req.body.message;
    if (true) { // Data is valid!
        try {
            // Create a PI:
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // In cents
                currency: 'inr',
                receipt_email: userLogin,
            });
            res.render('card', { key: publisher_key, amount: amount * 100, intentSecret: paymentIntent.client_secret });
        } catch (err) {
            console.log('Error! ', err.message);
        }
    } else {
        res.render('donations', { title: 'Donate', errors: errors });
    }
});

app.post('/payment', function (req, res) {

    amount = Math.round(amount * 100);
    console.log(amount / 100);
    console.log(message);

    const newMoneyDonate = new MoneyDonate({
        email: userLogin,
        amount: amount / 100,
        message: message,
        date: stringDate
    })

    const customers = stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Charity Donations',

    })
        .then((customer) => {

            return stripe.charges.create({
                amount: amount,    // Charing Rs 25 
                description: 'Chairty which cares for others',
                currency: 'inr',
                customer: customer.id
            });
        })
        .then((charge) => {
            // res.send("Success") // If no error occurs 
            newMoneyDonate.save(function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Money Donated Successfully");
                    res.redirect('/');
                }
            });
        })
        .catch((err) => {
            res.send(err)    // If some error occurs 
        });

});

app.post('/donateClothes', function (req, res) {

    const newClothDonate = new ClothDonate({
        email: userLogin,
        cloth_type: req.body.cloth_type,
        cloth_gender: req.body.cloth_gender,
        message: req.body.message,
        date: stringDate
    })

    newClothDonate.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Data Inserted Successfully");
            res.redirect('/');
        }
    });
})

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


// Past-History Route

app.get("/check-past-history", function (req, res) {
    if (userLogin) {
        MoneyDonate.find({ email: userLogin }, function (err, foundMoneyHistory) {
            if (err) {
                console.log(err);
            }
            else {
                ClothDonate.find({ email: userLogin }, function (err, foundClothHistory) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var history = foundMoneyHistory.concat(foundClothHistory);
                        // console.log(history);
                        res.render("past-history", { history: history, myAccount: userLogin });

                    }
                })

            }
        })
    }
    else {
        res.redirect('/login');
    }

});

app.get("/home", function (req, res) {
    res.redirect("/");
});

app.get("/", function (req, res) {
    res.render("home", { myAccount: userLogin });
});

app.get("/contact", function (req, res) {
    res.render("contact", { myAccount: userLogin });
});

app.get("/about", function (req, res) {
    res.render("about", { myAccount: userLogin });
});

app.get("/missions", function (req, res) {
    res.render("missions", { myAccount: userLogin });
});

app.get("/gallery", function (req, res) {
    res.render("gallery", { myAccount: userLogin });
});

app.get("/logout", function (req, res) {
    userLogin = false;
    res.clearCookie('userLogin');
    // console.log(req.cookies);
    res.redirect("/");
});

app.use(function (req, res, next) {
    res.status(404).render('404', { myAccount: userLogin });
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
