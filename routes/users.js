const express = require('express')
const router = express.Router()
const User = require('../models/user')
const users = require('../controllers/users')

function wrapFunction(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
    }
}



// Register User
router.get('/', users.renderUserForm)

    .post('/', wrapFunction(users.postUser))




module.exports = router