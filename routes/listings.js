const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });
const { listingSchema } = require('../schema.js');

// Validate listing request body with Joi
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};

// Create listing route
router.post(
    '/',
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.create)
);

// New listing form route
router.get('/new', listingController.new);

// Edit listing form route
router.get('/:id/edit', wrapAsync(listingController.edit));

// Show, Update & Delete listing routes
router.route('/:id')
    .get(wrapAsync(listingController.show))
    .put(upload.single('listing[image]'), validateListing, wrapAsync(listingController.update))
    .delete(wrapAsync(listingController.delete));

module.exports = router;