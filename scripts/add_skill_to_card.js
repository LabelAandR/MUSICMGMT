require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');

async function addSkillToCard() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all Soulful Singer cards
        const cards = await Card.find({ name: 'Soulful Singer' });
        console.log(`Found ${cards.length} Soulful Singer cards`);

        // Update each card with the new skill
        for (const card of cards) {
            card.description = 'A powerful voice that resonates with the audience. Their inspiring performance empowers the next musician to shine even brighter.';
            card.skill = {
                name: 'Inspiring Performance',
                description: 'Doubles the hype value of the next card played',
                effect: 'next_card_hype_multiplier_2x'
            };
            await card.save();
            console.log(`Updated card owned by: ${card.owner || 'no owner'}`);
        }

        console.log('Successfully updated Soulful Singer cards');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addSkillToCard();
