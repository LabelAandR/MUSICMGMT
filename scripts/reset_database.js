const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
const Listing = require('../models/Listing');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/windsurf';

async function resetDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear all collections
        await User.deleteMany({});
        await Card.deleteMany({});
        await Listing.deleteMany({});

        console.log('Database reset successful');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
