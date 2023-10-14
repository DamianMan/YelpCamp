
const express = require('express')
const router = express.Router()
const Campground = require('../models/campground');
const Review = require('../models/review')
const isLoggedIn = require('../loginMiddleware')
const campgrounds = require('../controllers/campgrounds')
// Multer used to retrive file uploaded with req.body
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage: storage })



const AppError = require('../errors/AppError');

const { campJoiSchema, reviewJoiSchema } = require('../joiSchema')




function wrapFunction(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next)
    }
}


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



// Set Middleware to check if CurrentUser is equal review auhtor
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)


    if (!review.author.equals(req.user.id)) {
        req.flash('error', 'You don NOT have the permission to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


// set Middleware to VALIDATE with JOI
const validateCampgrounds = (req, res, next) => {

    const result = campJoiSchema.validate(req.body)
    console.log(req.body.campgrounds)
    if (result.error) {
        console.log(result.error.details)

        const msg = result.error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}






// All Campgrounds and  Post camppground
router.get('/', wrapFunction(campgrounds.index))
    .post('/', isLoggedIn, upload.array('image'), validateCampgrounds, wrapFunction(campgrounds.post_camp))

// upload.single for single file and upload.array for multiple files(needs to change in html input to MULTIPLE)
// .post('/', upload.single('image'), (req, res) => {
//     console.log(req.body)
//     res.send('it worked')
// })


// Make New Campground
router.get('/new', isLoggedIn, campgrounds.new)






// Get Campground by ID, Update and Delete
router.get('/:id', wrapFunction(campgrounds.show))

    .put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampgrounds, wrapFunction(campgrounds.updateCamp))

    .delete('/:id', isLoggedIn, isAuthor, wrapFunction(campgrounds.deleteCamp))



// Update Campground
router.get('/:id/edit', isLoggedIn, isAuthor, wrapFunction(campgrounds.editCampForm))



// Delete Review
router.delete('/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapFunction(campgrounds.deleteReview))





module.exports = router;

