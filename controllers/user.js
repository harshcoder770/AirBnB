const User = require('../models/user');
const Listing = require('../models/listing');

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render('users/register');
};

// Handle Signup Logic
module.exports.signup = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Airbnb!');
            res.redirect('/');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

// Handle Post-Login Redirect
module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Handle Logout Logic
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You are logged out!');
        res.redirect('/');
    });
};

// Render User Profile Page
module.exports.profile = async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to view your profile!');
        return res.redirect('/login');
    }

    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
        req.flash('error', 'User account not found!');
        return res.redirect('/');
    }

    const favoriteListings = (user.favorites || []).filter(Boolean);
    const hostedListings = await Listing.find({ owner: req.user._id });

    res.render('users/profile', { user, favoriteListings, hostedListings });
};

// Toggle Listing Favorite
module.exports.toggleFavorite = async (req, res) => {
    const wantsJson = req.headers.accept && req.headers.accept.includes('application/json');

    if (!req.isAuthenticated()) {
        req.flash('error', 'Please log in to like and save favorite stays!');
        if (wantsJson) {
            return res.status(401).json({ requiresLogin: true, redirectUrl: '/login' });
        }
        return res.redirect('/login');
    }

    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        if (wantsJson) {
            return res.status(404).json({ error: 'Listing not found' });
        }
        req.flash('error', 'Listing does not exist!');
        return res.redirect('/');
    }

    const user = await User.findById(req.user._id);
    const alreadyLiked = user.favorites.some((favId) => favId.equals(listing._id));

    if (alreadyLiked) {
        user.favorites.pull(listing._id);
    } else {
        user.favorites.addToSet(listing._id);
    }

    await user.save();
    const liked = !alreadyLiked;

    if (wantsJson) {
        return res.json({ liked, favoritesCount: user.favorites.length });
    }

    req.flash('success', liked ? 'Added to your favorites!' : 'Removed from your favorites.');
    res.redirect(req.get('Referer') || '/profile');
};