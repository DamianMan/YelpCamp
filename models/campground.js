const mongoose = require('mongoose')
const Review = require('./review')

const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image: [
        {
            url: String,
            filename: String
        }
    ],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },

    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: campgrounds.reviews
            }
        })
    }
})


module.exports = mongoose.model('Campground', campgroundSchema)