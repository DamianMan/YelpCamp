const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({
    body: String,
    rating: Number,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model('Review', reviewSchema)