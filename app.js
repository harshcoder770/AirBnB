if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const MongoStore = require('connect-mongo').default;

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');
const userRouter = require('./routes/user');
const listingController = require('./controllers/listing');
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const wrapAsync = require('./utils/wrapAsync');


// Connect to MongoDB

main()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.log('Error connecting to MongoDB', err);
    });
async function main() {
    await mongoose.connect(process.env.ATLASDB_URL);
}


// Session Configuration


// Mongo Session Store Configuration
const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on('error', (err) => {
    console.log('ERROR in MONGO SESSION STORE:', err);
});

// Session Configuration
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

// App & Middleware Configuration
const app = express();
app.use(session(sessionOptions));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals & Flash Messages Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    res.locals.searchQuery = req.query.q ? req.query.q.trim() : '';
    res.locals.activeCategory = req.query.category ? req.query.category.trim() : 'All';
    next();
});

// Root Route
app.get('/', wrapAsync(listingController.index));

// Application Routers
app.use('/', userRouter);
app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);

// 404 Not Found Handler
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!! Please try again later' } = err;
    res.status(statusCode).render('error', { message, err });
});

// Start Server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});