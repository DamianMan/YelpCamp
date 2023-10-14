
const express = require('express')
const router = express.Router()
const passport = require('passport')
const login = require('../controllers/login')


function wrapFunction(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
    }
}


// Middleware to catch URL and returtn to it
storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next()
};


//   Login User
router.get('/login', login.renderLoginForm)

    .post('/login/', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), login.logIn
    )

// logout User
router.get('/logout', login.logOut)


module.exports = router