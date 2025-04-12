const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Card = require('../models/Card');
const Listing = require('../models/Listing');

const MONGODB_URI = 'mongodb+srv://tubsgpt:Capse77acyborg@mgmtdb.laof0ub.mongodb.net/?retryWrites=true&w=majority&appName=mgmtdb';

const testAccounts = [
    {
        email: 'rockstar@test.com',
        username: 'RockStar',
        password: 'test123',
        currency: 100000
    },
    {
        email: 'jazz@test.com',
        username: 'JazzCat',
        password: 'test123',
        currency: 100000
    },
    {
        email: 'beats@test.com',
        username: 'BeatMaker',
        password: 'test123',
        currency: 100000
    }
];

async function initializeTestAccounts() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully');

        // Create test accounts
        for (const account of testAccounts) {
            const existingUser = await User.findOne({ email: account.email });
            if (existingUser) {
                // Update currency if user exists
                existingUser.currency = account.currency;
                await existingUser.save();
                console.log(`Updated currency for ${account.username}`);
            } else {
                const hashedPassword = await bcrypt.hash(account.password, 10);
                const user = new User({
                    email: account.email,
                    username: account.username,
                    password: hashedPassword,
                    currency: account.currency
                });
                await user.save();
                console.log(`Created test account: ${account.username}`);
            }
        }

        console.log('Test accounts initialization complete');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing test accounts:', error);
        process.exit(1);
    }
}

initializeTestAccounts();
