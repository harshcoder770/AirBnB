const express = require ('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const listingsRouter = require('./routes/listings');
const reviewsRouter = require('./routes/reviews');




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




// all Paths

app.get('/', (req, res) => {
    res.send('Hello World');
})
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