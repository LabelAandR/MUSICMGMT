require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function updateUserCurrency() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update all test accounts to have 20000 currency
        const result = await User.updateMany(
            { email: { $in: ['rockstar@test.com', 'jazz@test.com', 'beats@test.com'] } },
            { $set: { currency: 20000 } }
        );

        console.log(`Updated ${result.modifiedCount} users to have 20000 gold`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateUserCurrency();
