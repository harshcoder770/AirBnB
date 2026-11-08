const express = require('express');
const router = express.Router({ mergeParams: true }); // 👈 Crucial: mergeParams: true
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); // 👈 Added missing import
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
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

// Delete Review Route
router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;