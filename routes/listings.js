const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); // 👈 Added missing import
const { listingSchema } = require('../schema.js');



// Validation middleware for listings
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}







// Index Route 
router.get('/', wrapAsync(async (req, res) => {
   const allLisitings = await Listing.find({})
   res.render('listings/index', { listings: allLisitings });
}));

// Create form route
router.get('/new', (req, res) => {
    res.render('listings/new');
});

// Show Route
router.get("/:id" , wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews'); 
    res.render('listings/show', { listing, review: listing.reviews });
}))

// Edit form route
router.get('/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit', { listing });
}));

// Edit route
router.put('/:id',validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete route
router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

//create route
router.post('/', validateListing, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect('/listings');
  
   
}))

module.exports = router;