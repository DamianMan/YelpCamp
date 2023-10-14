module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.logIn = (req, res) => {

    req.flash('success', 'Welcome back, Logged in!');

    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)
}


module.exports.logOut = (req, res, next) => {

    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out! Goodbye!')
        res.redirect('/campgrounds')
    })


}