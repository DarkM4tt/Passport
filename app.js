const express = require('express')
const mongoose = require('mongoose')
const nodemon = require('nodemon')
const passport = require('passport')
const bodyParser = require('body-parser')
const LocalStrategy = require('passport-local')
const passportLocalMongoose = require('passport-local-mongoose')
const User = require('./models/user')

mongoose.connect(
  'mongodb+srv://Prabhat:studentschema@cluster0.cqpz5.mongodb.net/test?retryWrites=true&w=majority',
  {},
  function (err) {
    console.log(err)
  }
)

const app = express()
const PORT = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.use(
  require('express-session')({
    secret: 'Mary had a little lamb',
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()))
// reads the session, this is added to our UserSchema through passportLocalMongoose
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// ROUTES
app.get('/', function (req, res) {
  res.render('home')
})

app.get('/secret', isLoggedIn, function (req, res) {
  res.render('secret')
})

// AUTH ROUTES
// displays sign up form
app.get('/register', function (req, res) {
  res.render('register')
})

// handles user sign up
app.post('/register', function (req, res) {
  req.body.username
  req.body.password
  User.register(
    new User({
      username: req.body.username,
    }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err)
        return res.render('register')
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/secret')
      })
    }
  )
})

// LOGIN ROUTES
// renders log in form
app.get('/login', function (req, res) {
  res.render('login')
})

// login logic
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login',
  }),
  function (req, res) {
    console.log(res)
  }
)

// LOGOUT ROUTE
app.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

// check if user is logged in and has access to secret page
// passed as middleware to secret route
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

app.listen(PORT, function () {
  console.log('server started')
})
