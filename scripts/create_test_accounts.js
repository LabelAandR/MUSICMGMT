const mongoose = require('mongoose');
const User = require('../models/User');
const { createTestCards } = require('./create_test_cards');
const Listing = require('../models/Listing');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/windsurf';

const TEST_ACCOUNTS = [
    { username: 'RockStar', email: 'rockstar@test.com', password: 'test123' },
    { username: 'JazzMaster', email: 'jazz@test.com', password: 'test123' },
    { username: 'BeatMaker', email: 'beats@test.com', password: 'test123' }
];

async function createTestAccounts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing test data
        await User.deleteMany({ email: { $in: TEST_ACCOUNTS.map(a => a.email) } });
        console.log('Cleared existing test accounts');

        // Create test accounts
        const accounts = [
            { email: 'rockstar@test.com', password: 'test123', username: 'RockStar' },
            { email: 'jazz@test.com', password: 'test123', username: 'JazzCat' },
            { email: 'beats@test.com', password: 'test123', username: 'BeatMaker' }
        ];

        for (const account of accounts) {
            const hashedPassword = await bcrypt.hash(account.password, 10);
            const user = new User({
                email: account.email,
                password: hashedPassword,
                username: account.username,
                currency: 20000
            });
            await user.save();
            console.log(`Created account: ${account.email}`);

            // Create cards for this user
            const cards = await createTestCards(user._id);
            console.log(`Created ${cards.length} cards for ${account.email}`);

            // List some cards in the marketplace
            const cardsToList = cards.slice(0, 3); // List first 3 cards
            for (const card of cardsToList) {
                const listing = new Listing({
                    card: card._id,
                    seller: user._id,
                    price: Math.floor(Math.random() * 1000) + 500 // Random price between 500 and 1500
                });
                await listing.save();
                
                // Update card's forSale status
                card.forSale = true;
                await card.save();
                
                console.log(`Listed card ${card.name} for ${listing.price} gold`);
            }
        }

        console.log('Test accounts and cards created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating test accounts:', error);
        process.exit(1);
    }
}

createTestAccounts();
