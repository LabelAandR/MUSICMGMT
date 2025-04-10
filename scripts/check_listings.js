require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const Card = require('../models/Card');
const User = require('../models/User');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/windsurf');
        
        console.log('\nChecking Users:');
        const users = await User.find();
        console.log(`Found ${users.length} users:`);
        for (const user of users) {
            console.log(`- ${user.username} (${user.email})`);
        }

        console.log('\nChecking Cards:');
        const cards = await Card.find();
        console.log(`Found ${cards.length} cards:`);
        for (const card of cards) {
            console.log(`- ${card.name} (Owner: ${card.owner})`);
        }

        console.log('\nChecking Listings:');
        const listings = await Listing.find()
            .populate('card')
            .populate('seller', 'username');
        console.log(`Found ${listings.length} listings:`);
        for (const listing of listings) {
            console.log(`- Card: ${listing.card?.name || 'Unknown'}`);
            console.log(`  Seller: ${listing.seller?.username || 'Unknown'}`);
            console.log(`  Price: ${listing.price}`);
            console.log('  Raw listing:', listing);
        }

        console.log('\nChecking specific test accounts:');
        const testEmails = ['ccgfan@test.com', 'mtg@test.com', 'cardmaster@test.com'];
        for (const email of testEmails) {
            const user = await User.findOne({ email });
            if (user) {
                const userCards = await Card.find({ owner: user._id });
                const userListings = await Listing.find({ seller: user._id });
                console.log(`\n${email}:`);
                console.log(`- Has ${userCards.length} cards`);
                console.log(`- Has ${userListings.length} listings`);
            } else {
                console.log(`\n${email}: Not found`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase().catch(console.error);
