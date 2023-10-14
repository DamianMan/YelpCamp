const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedsHelper');

main().catch(err => console.log('Error Connection:', err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
        useNewUrlPArser: true,
        useUnifiedTopology: true
    });
    console.log('Database Connected')
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}



const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 150; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30) + 10
        const camp = new Campground({
            author: '651e8c9ae318566ad90ed242',
            location: `${cities[random1000].city} - ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            title: `${sample(descriptors)} - ${sample(places)} `,
            image: [
                {
                    url: 'https://res.cloudinary.com/dqbp3069i/image/upload/v1696870764/YelpCamp/tmo9ebwlttkhscwk2m7t.jpg',
                    filename: 'YelpCamp/tmo9ebwlttkhscwk2m7t',
                },
                {
                    url: 'https://res.cloudinary.com/dqbp3069i/image/upload/v1696870764/YelpCamp/pgbovxip4ltuapxakehm.jpg',
                    filename: 'YelpCamp/pgbovxip4ltuapxakehm',
                },
                {
                    url: 'https://res.cloudinary.com/dqbp3069i/image/upload/v1696870764/YelpCamp/bgpuyufvb161ae0zrx3f.jpg',
                    filename: 'YelpCamp/bgpuyufvb161ae0zrx3f',
                }
            ],
            description: "Lorem Ipsum porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...",
            price: price
        })

        await camp.save();
    }
}
seedDB().then(() => {
    mongoose.connection.close()
})