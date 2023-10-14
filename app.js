if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Joi = require('joi')
const ejsMate = require('ejs-mate')
const morgan = require('morgan');
const methodOverride = require('method-override');
const AppError = require('./errors/AppError');
const { status } = require('express/lib/response');
const campgroundsRoute = require('./routes/campgrounds')
const reviewsRoute = require('./routes/reviews')
const registerRoute = require('./routes/users')
const loginRoute = require('./routes/login')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const passportLocal = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');

const dbURL = process.env.MONGO_URL

// Set connection DB
main().catch(err => console.log('Error Connection:', err));

async function main() {
    await mongoose.connect(dbURL, {
        useNewUrlPArser: true,
        useUnifiedTopology: true
    });
    console.log('Database Connected')
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());   // Not allows to any $ operator to be triggered in the query, body or params

// Session Config


const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbURL,
        dbName: "yelp-camp",
        touchAfter: 24 * 60 * 60,
        secret: "thesecretisout",
    }),
    name: 'session',  // custom name to the ID SESSION
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,        // added with https when deploying
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash())





// PAssport Use
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())     // Store in the session
passport.deserializeUser(User.deserializeUser())     // UNstore in the session


// Set middleware for flash SUCCESS messages for every route
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})




app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(morgan('common'));



// Set default Route

app.use('/campgrounds', campgroundsRoute)
app.use('/campgrounds/:id/review', reviewsRoute)
app.use('/register', registerRoute)
app.use('/', loginRoute)




app.get('/', (req, res) => {
    res.render('home')
})


// set Middleware to VALIDATE with JOI
// const validateCampgrounds = (req, res, next) => {

//     const result = campJoiSchema.validate(req.body)
//     console.log(req.body.campgrounds)
//     if (result.error) {
//         console.log(result.error.details)

//         const msg = result.error.details.map(el => el.message).join(',')
//         throw new AppError(msg, 400)
//     } else {
//         next();
//     }
// }

// const validateReviews = (req, res, next) => {
//     const result = reviewJoiSchema.validate(req.body)
//     if (result.error) {
//         console.log(result.error.details)

//         const msg = result.error.details.map(el => el.message).join(',')
//         throw new AppError(msg, 400)
//     } else {
//         next();
//     }
// }





// // Set  Middleware with NEXT
// const verifyPassword = (req, res, next) => {
//     const { password } = req.query;
//     if (password === 'Aaron') {
//         next();
//     }
//     throw new AppError('Password needed!', 401)
// }




// // Wrap Function to AVOID repetition of "try" and "catch"
// function wrapFunction(fn) {
//     return function (req, res, next) {
//         fn(req, res, next).catch(next)
//     }
// }



// Error Handling Middleware


// app.get('/admin', (req, res) => {
//     throw new AppError("You're NOT an ADMIN", 403)
// })

// app.get('/error', (req, res) => {
//     chicken.gfh()
// })





// Protecting Route with Middleware
// app.get('/secret', verifyPassword, (req, res) => {
//     res.send('I like Cat and Dogs')
// })



// REgister New User with Passport
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ username: 'Chri', email: 'chri@mail.com' })
//     const newUser = await User.register(user, 'maincraft')  // Pass the USER and the PASSWORD(hash)
//     res.send(newUser)
// })









// For ALL routes
app.all('*', (req, res, next) => {
    next(new AppError('Page not found!', 404))
})



// Error Handling Middleware at the Bottom

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'Something went wrong!'
    res.status(status).render('campgrounds/errors_temp', { err })
})



app.listen(3000, () => {
    console.log('Liste to port 3000')
})