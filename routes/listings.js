const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); 
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
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new listing!');
        return res.redirect('/login');
    
    }
    res.render('listings/new');
});

// Show Route
router.get("/:id" , wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'user' } }).populate('owner');
    if(!listing) {
        req.flash('error', 'Listing Does not Exist!');
        return res.redirect('/listings');
    }
    res.render('listings/show', { listing, review: listing.reviews });
}))

// Edit form route
router.get('/:id/edit', wrapAsync(async (req, res) => {

    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to edit a listing!');
        return res.redirect('/login');
    }
    const { id } = req.params;
    const listing = await Listing.findById(id);
     if(!listing) {
        req.flash('error', 'Listing Does not Exist!');
        return res.redirect('/listings');
    }
        if(!listing.owner._id.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to edit this listing!');
            return res.redirect(`/listings/${id}`);
        }
    res.render('listings/edit', { listing });
}));

// Update route
router.put('/:id',validateListing, wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to edit a listing!');
        return res.redirect('/login');
    }
    const { id } = req.params;
    let  listing = await Listing.findById(id);
        if(!listing.owner._id.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to edit this listing!');
            return res.redirect(`/listings/${id}`);
        }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash('success', 'Successfully updated the listing!');

    res.redirect(`/listings/${id}`);
}));

// Delete route
router.delete('/:id', wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to delete a listing!');
        return res.redirect('/login');
    }
    const { id } = req.params;
     let  listing = await Listing.findById(id);
        if(!listing.owner._id.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to delete this listing!');
            return res.redirect(`/listings/${id}`);
        }
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the listing!');
    res.redirect('/listings');
}));

//create route
router.post('/', validateListing, wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new listing!');
        return res.redirect('/login');
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; 
    await newListing.save();
    req.flash('success', 'Successfully made a new listing!');
    res.redirect('/listings');
  
   
}))

module.exports = router;