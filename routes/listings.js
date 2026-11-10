const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const listingController = require('../controllers/listing.js')

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


router.route('/')
    .get(wrapAsync(listingController.index))
    .post(validateListing, wrapAsync(listingController.create))


router.route('/:id')
    .get(wrapAsync(listingController.show))
    .put(validateListing, wrapAsync(listingController.update))
    .delete(wrapAsync(listingController.delete));


// Create form route
router.get('/new', listingController.new);

// Edit form route
router.get('/:id/edit', wrapAsync(listingController.edit));




module.exports = router;