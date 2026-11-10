const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const listingController = require('../controllers/listing.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });
const { listingSchema } = require('../schema.js');

// Validation middleware for listings
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// 1. Index & Create Routes
router.route('/')
    .get(wrapAsync(listingController.index))
    .post(upload.single('listing[image]'), validateListing, wrapAsync(listingController.create));

// 2. New Route (Must be before /:id)
router.get('/new', listingController.new);

// 3. Edit Form Route
router.get('/:id/edit', wrapAsync(listingController.edit));

// 4. Show, Update & Delete Routes
router.route('/:id')
    .get(wrapAsync(listingController.show))
    .put(upload.single('listing[image]'), validateListing, wrapAsync(listingController.update))
    .delete(wrapAsync(listingController.delete));

module.exports = router;