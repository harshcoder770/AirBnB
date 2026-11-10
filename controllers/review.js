const express = require('express');
const Listing = require('../models/Listing');
const Review = require('../models/reviews');


module.exports.create = async (req, res) => {
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
}


module.exports.delete = async (req, res) => {
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
}