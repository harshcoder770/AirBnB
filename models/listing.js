const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./reviews');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
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
    category: {
        type: String,
        enum: [
            "Trending",
            "Amazing pools",
            "Houses",
            "Mansions",
            "Beachfront",
            "Cabins",
            "Iconic cities",
            "Lakefront",
            "Countryside",
            "Camping",
            "Arctic",
            "Farms"
        ],
        default: "Trending",
        required: true,
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

listingSchema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews }
        });
    }
});

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);
module.exports = Listing;