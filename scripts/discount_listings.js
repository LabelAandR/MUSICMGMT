require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Card = require('../models/Card');

async function discountListings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all listings to have 50% off
        const listings = await Listing.find({});
        for (const listing of listings) {
            listing.price = Math.floor(listing.price * 0.5);
            await listing.save();
            console.log(`Updated listing price to ${listing.price} gold`);
        }

        // Fix Jazz Virtuoso image
        const jazzCards = await Card.find({ name: 'Jazz Virtuoso' });
        for (const card of jazzCards) {
            card.imageFile = 'synth-wizard.jpg'; // Let's try a different image
            await card.save();
            console.log(`Updated Jazz Virtuoso image to synth-wizard.jpg`);
        }

        console.log('Successfully updated all listings and Jazz Virtuoso images');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

discountListings();
