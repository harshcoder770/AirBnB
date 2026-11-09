const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError'); 
const User = require('../models/user');
const passport = require('passport');



router.get('/signup', (req, res) => {
    res.render('users/register');
});


router.post('/signup', wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to AirBnb!');
            res.redirect('/listings');
        });
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
}));


router.get('/login', (req, res) => {
    res.render('users/login');
});


router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),  wrapAsync(async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/listings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);

   
    
}));


router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'You are logged out!');
        res.redirect('/listings');
    });
});




module .exports = router;