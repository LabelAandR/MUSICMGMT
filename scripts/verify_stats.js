require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');

async function verifyStats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const cards = await Card.find({}).sort({ name: 1 });
        
        console.log('\nCard Stats Summary:');
        console.log('=================');
        
        cards.forEach(card => {
            console.log(`\n${card.name}:`);
            console.log(`  Hype: ${card.hype}`);
            console.log(`  Physical: ${card.physical}`);
            console.log(`  Concentration: ${card.concentration}`);
            
            // Verify stats are within 1-10 range
            const stats = [card.hype, card.physical, card.concentration];
            const outOfRange = stats.some(stat => stat < 1 || stat > 10);
            if (outOfRange) {
                console.log('  ⚠️ WARNING: Some stats are outside the 1-10 range!');
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

verifyStats();
