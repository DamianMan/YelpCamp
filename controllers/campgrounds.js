const Campground = require('../models/campground')
const Review = require('../models/campground')
const { cloudinary } = require('../cloudinary')
const tt = require("@tomtom-international/web-sdk-services/dist/services-node.min.js")




module.exports.index = (async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index.ejs', { campgrounds })
})

module.exports.new = (req, res) => {
    console.log(process.env.MAP_KEY)

    res.render('campgrounds/new.ejs')
}


module.exports.show = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')
    if (!camp) {
        req.flash('error', 'Cannot find that Campground!')
        res.redirect('/campgrounds')
    }

    res.render('campgrounds/show.ejs', { camp, id })
}

module.exports.post_camp = async (req, res, next) => {
    const camp = new Campground(req.body);

    const geoData = tt.services.geocode({
        key: process.env.MAP_TT_KEY,
        query: camp.location
    }).then(res => {
        return res.toGeoJson
    });
    if (!geoData) {
        req.flash('error', 'Mispelled Location. Try again')
        res.redirect('/campgrounds/new')
    }


    geoData.then(async res => {
        camp.geometry = res().features[0].geometry
        await camp.save()
    })
    camp.author = req.user.id
    camp.image = req.files.map(f => ({ url: f.path, filename: f.filename }))



    await camp.save();
    console.log(camp)
    req.flash('success', 'Succesly made a new campground')

    res.redirect(`/campgrounds/${camp.id}`)
}


module.exports.editCampForm = async (req, res, next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id)
    if (!camp) {
        req.flash('error', 'Cannot find that Campground!')
        res.redirect('/campgrounds')
    }


    res.render('campgrounds/edit', { camp, id })
}



module.exports.updateCamp = async (req, res, next) => {
    const { id } = req.params;
    const { title, location, price, description } = req.body;
    console.log(req.body)
    const camp = await Campground.findByIdAndUpdate(id, { title, location, price, description })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    camp.image.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)  // Delete images to CLOUDINARY
        }
        await camp.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImages } } } })  // Update camp.image pulling out all IN req.body.deleteImages
        console.log(camp)
    }
    await camp.save();
    req.flash('success', 'Campground Updated with success!')
    res.redirect(`/campgrounds/${camp.id}`)
}


module.exports.deleteCamp = async (req, res, next) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndRemove(id)
    await Review.deleteMany({
        _id: {
            $in: campground.reviews
        }
    })
    req.flash('success', 'Successfully deleted campground')

    res.redirect('/campgrounds')
}


module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    console.log('YAY!')
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndRemove(reviewId)

    res.redirect(`/campgrounds/${id}`)
}