const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');
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
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
})

listingSchema.post('findOneAndDelete', async (doc) => {
    if(doc){
        await Review.deleteMany({
            _id : {
                $in : doc.reviews
            }
        })
    }
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;