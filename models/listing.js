const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: 'https://a0.muscache.com/im/pictures/542cda48-56f2-4d66-aa82-c842025c8f66.jpg?im_w=720',
        set: (value) => value === '' ? 'https://a0.muscache.com/im/pictures/542cda48-56f2-4d66-aa82-c842025c8f66.jpg?im_w=720' : value
    },
    price: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },  
    country: {
        type: String,
        required: true,
    }
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;