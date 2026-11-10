const express = require('express');
const router = express.Router({ mergeParams: true });  
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); 
const { reviewSchema } = require('../schema.js');
const reviewController = require('../controllers/review.js')

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
router.post('/', validateReview, wrapAsync(reviewController.create));

// Delete Review Route
router.delete('/:reviewId', wrapAsync(reviewController.delete));

module.exports = router;