const mongoose = require("mongoose");
const path = require("path");
const Listing = require("../models/Listing");
const data = require("./data");



async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
}
main().then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB', err);
})



const initListings = async () => {
    try {
        await Listing.deleteMany({});
        console.log('Existing listings deleted successfully');
    } catch (err) {
        console.error('Error deleting existing listings:', err);
    }
    try {
        await Listing.insertMany(data.data);
        console.log('Listings inserted successfully');
    } catch (err) {
        console.error('Error inserting listings:', err);
    }

}
initListings();