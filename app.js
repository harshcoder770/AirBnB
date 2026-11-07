const express = require ('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const Listing = require('./models/Listing');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');





async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
})








const app = express();




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')));










app.get('/', (req, res) => {
    res.send('Hello World');
})

app.get('/listings', wrapAsync(async (req, res) => {
   const allLisitings = await Listing.find({})
   res.render('listings/index', { listings: allLisitings });
}));

app.get('/listings/new', (req, res) => {
    res.render('listings/new');
});

app.get("/listings/:id" , wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id); 
    res.render('listings/show', { listing });
}))


app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit', { listing });
}));

app.put('/listings/:id', wrapAsync(async (req, res) => {
    if(!req.body.listing) throw new ExpressError('Invalid Listing Data', 400);
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

app.post('/listings',  wrapAsync(async (req, res, next) => {
    if(!req.body.listing) throw new ExpressError('Invalid Listing Data', 400);
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
  
   
}))



app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    let {statusCode=500 , message= 'Something went wrong!! Please try again later'} =  err;
     res.status(statusCode).render('error', { message, err });
})


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})