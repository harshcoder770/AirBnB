const express = require('express');
const router = express.Router({ mergeParams: true });  
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); 
const Listing = require('../models/Listing');
const Review = require('../models/reviews');
const { reviewSchema } = require('../schema.js');


// Validation middleware for reviews

const validateReview = (req, res, next) => {
    
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};






// Post Review Route
router.post('/', validateReview, wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to post a review!');
        return res.redirect('/login');
    }
    if (!req.user) {
        req.flash('error', 'You must be signed in to post a review!');
        return res.redirect('/login');
    }
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    review.user = req.user._id; 
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success', 'Successfully made a new review!');

    res.redirect(`/listings/${id}`);
}));

// Delete Review Route
router.delete('/:reviewId', wrapAsync(async (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to delete a review!');
        return res.redirect('/login');
    }
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(review.user && !review.user.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this review!');
        return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review!');   
    res.redirect(`/listings/${id}`);
}));

module.exports = router;