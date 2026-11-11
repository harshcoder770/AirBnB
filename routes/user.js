const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const userController = require('../controllers/user');

// Signup Routes
router.route('/signup')
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// Login Routes
router.route('/login')
    .get(userController.renderLoginForm)
    .post(
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true,
        }),
        userController.login
    );

// Logout Route
router.get('/logout', userController.logout);

// Profile Route
router.get('/profile', wrapAsync(userController.profile));

// Favorite Listing Toggle Route
router.post('/favorites/:id', wrapAsync(userController.toggleFavorite));

module.exports = router;