const express = require('express')
const router = express.Router({ mergeParams: true }) // Use mergeParams to pass variable to the default route
const Campground = require('../models/campground');
const Review = require('../models/review')
const isLoggedIn = require('../loginMiddleware')
const isAuthor = require('../loginMiddleware')




const AppError = require('../errors/AppError');

const { campJoiSchema, reviewJoiSchema } = require('../joiSchema')



function wrapFunction(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
    }
}



const validateReviews = (req, res, next) => {
    const result = reviewJoiSchema.validate(req.body)
    if (result.error) {
        console.log(result.error.details)

        const msg = result.error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}





// Post Review
router.post('/', isLoggedIn, isAuthor, validateReviews, wrapFunction(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    console.log(req.body)
    const rev = new Review(req.body)
    camp.reviews.push(rev)
    rev.author = req.user.id
    await camp.save()
    await rev.save()
    req.flash('success', 'Rieview Added')

    res.redirect(`/campgrounds/${id}`)
}))






module.exports = router;
