const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/reviews");
const User = require("../models/user");
const data = require("./data");

const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";

// Connect to MongoDB and re-seed all listings cleanly
const initListings = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");

        await Listing.deleteMany({});
        await Review.deleteMany({});
        console.log("Cleared existing listings and reviews");

        let owner = await User.findOne({});
        if (!owner) {
            const demoUser = new User({
                email: "host@airbnb.com",
                username: "airbnb_host",
            });
            owner = await User.register(demoUser, "host1234");
            console.log("Created default host account:", owner.username);
        }

        const seededListings = data.data.map((listing) => ({
            ...listing,
            owner: owner._id,
        }));

        await Listing.insertMany(seededListings);
        console.log(`Inserted ${seededListings.length} listings for owner: ${owner.username}`);
    } catch (err) {
        console.error("Error initializing database:", err);
    } finally {
        await mongoose.connection.close();
    }
};

initListings();