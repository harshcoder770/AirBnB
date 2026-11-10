const User = require('../models/user');

// 1. Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render('users/register');
};

// 2. Handle Signup Logic
module.exports.signup = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Airbnb!');
            res.redirect('/listings');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
};

// 3. Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
};

// 4. Handle Post-Login Redirect
module.exports.login = async (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/listings';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// 5. Handle Logout Logic
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You are logged out!');
        res.redirect('/listings');
    });
};