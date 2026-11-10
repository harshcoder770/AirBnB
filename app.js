if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require ('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');
const userRouter = require('./routes/user');
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const localStarategy = require('passport-local');
const User = require('./models/user');
const wrapAsync = require('./utils/wrapAsync');
const Listing = require('./models/Listing')
if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()

}
// console.log(process.env);


// Session Configuration
const sessionOptions = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}





// Connect to MongoDB

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
})










// Middlewares

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionOptions));
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStarategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





// Flash Messages Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
     res.locals.currUser = req.user;
    next();
});

// all Paths

app.get('/', wrapAsync(async(req, res) => {
        const allListings = await Listing.find({});
    
    res.render('root', {'listings' : allListings })
}))
app.use('/', userRouter);
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);






// Error Handling

app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    let {statusCode=500 , message= 'Something went wrong!! Please try again later'} =  err;
     res.status(statusCode).render('error', { message, err });
})


// Start the server

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})