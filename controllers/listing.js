const Listing = require('../models/Listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Index route with search and category filtering
module.exports.index = async (req, res) => {
    const searchQuery = req.query.q ? req.query.q.trim() : '';
    const selectedCategory = req.query.category ? req.query.category.trim() : 'All';

    const queryFilter = {};

    if (selectedCategory && selectedCategory !== 'All') {
        queryFilter.category = selectedCategory;
    }

    if (searchQuery) {
        const searchRegex = new RegExp(escapeRegex(searchQuery), 'i');
        queryFilter.$or = [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { category: searchRegex },
        ];
    }

    const listings = await Listing.find(queryFilter);
    res.render('listings/index', {
        listings,
        activeCategory: selectedCategory || 'All',
        searchQuery,
    });
};

// New listing form route
module.exports.new = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new listing!');
        return res.redirect('/login');
    }
    res.render('listings/new');
};

// Show listing details route
module.exports.show = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: 'reviews', populate: { path: 'user' } })
        .populate('owner');

    if (!listing) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/');
    }

    res.render('listings/show', { listing, review: listing.reviews });
};

// Edit listing form route
module.exports.edit = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to edit a listing!');
        return res.redirect('/login');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/');
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this listing!');
        return res.redirect(`/listings/${id}`);
    }

    res.render('listings/edit', { listing });
};

// Update listing route
module.exports.update = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to edit a listing!');
        return res.redirect('/login');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/');
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to edit this listing!');
        return res.redirect(`/listings/${id}`);
    }

    const updateData = { ...req.body.listing };
    delete updateData.image;

    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    let needsSave = false;

    if (updateData.location !== listing.location || updateData.country !== listing.country) {
        const geoResponse = await geocodingClient.forwardGeocode({
            query: `${updateData.location}, ${updateData.country}`,
            limit: 1,
        }).send();

        if (geoResponse.body.features.length > 0) {
            updatedListing.geometry = geoResponse.body.features[0].geometry;
            needsSave = true;
        }
    }

    if (typeof req.file !== 'undefined') {
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
        needsSave = true;
    }

    if (needsSave) {
        await updatedListing.save();
    }

    req.flash('success', 'Successfully updated the listing!');
    res.redirect(`/listings/${id}`);
};

// Delete listing route
module.exports.delete = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to delete a listing!');
        return res.redirect('/login');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/');
    }

    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to delete this listing!');
        return res.redirect(`/listings/${id}`);
    }

    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the listing!');
    res.redirect('/');
};

// Create listing route
module.exports.create = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to create a new listing!');
        return res.redirect('/login');
    }

    if (!req.file) {
        req.flash('error', 'Please upload an image for your listing!');
        return res.redirect('/listings/new');
    }

    const geoResponse = await geocodingClient.forwardGeocode({
        query: `${req.body.listing.location}, ${req.body.listing.country}`,
        limit: 1,
    }).send();

    if (!geoResponse.body.features.length) {
        req.flash('error', 'Location could not be found on the map. Please try a more specific city or country.');
        return res.redirect('/listings/new');
    }

    const newListing = new Listing(req.body.listing);
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
    };
    newListing.geometry = geoResponse.body.features[0].geometry;
    newListing.owner = req.user._id;

    await newListing.save();
    req.flash('success', 'Successfully made a new listing!');
    res.redirect('/');
};