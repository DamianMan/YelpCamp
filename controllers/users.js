const User = require('../models/user')

module.exports.renderUserForm = (req, res) => {
    res.render('users/register')
}


module.exports.postUser = async (req, res, next) => {
    const { username, email, password } = req.body
    const user = new User({ username: username, email: email })
    const usernameInDB = await User.findOne({ username })
    const emailInDB = await User.findOne({ email })

    if (!usernameInDB && !emailInDB) {
        const newUser = await User.register(user, password);
        req.login(newUser, function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'User registered successfully')
            res.redirect('/campgrounds')

        })

    } else {
        if (usernameInDB) {
            req.flash('error', 'Username already exists!')
            res.redirect('/register')
        } else if (emailInDB) {
            req.flash('error', 'Email already exists!')
            res.redirect('/register')
        }
    }


}