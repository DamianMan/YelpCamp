const Review = require('./models/review')
const Campground = require('./models/campground')


// Set Middleware to check if CurrentUser is equal to Logged User
const isAuthor = async (req, res, next) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if (!camp.author.equals(req.user.id)) {
        req.flash('error', 'You don NOT have the permission to do that!')
        return res.redirect(`/campgrounds/${camp.id}`)
    }
    next();
}

module.exports = isAuthor;






const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.flash('error', 'You must be logged in!')
        req.session.returnTo = req.originalUrl

        return res.redirect('/login')
    }
    next();
}
module.exports = isLoggedIn;
