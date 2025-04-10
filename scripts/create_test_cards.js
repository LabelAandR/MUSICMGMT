const mongoose = require('mongoose');
const Card = require('../models/Card');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/windsurf';

const MUSIC_CARDS = [
    {
        name: 'Bass Virtuoso',
        imageFile: 'bass.jpg',
        description: 'A master of the low end, bringing groove and foundation to any performance.',
        hype: 8,
        physical: 6,
        concentration: 7
    },
    {
        name: 'Guitar Mage',
        imageFile: 'guitar-mage.jpg',
        description: 'Weaves spells of sound with six strings, enchanting audiences with every riff.',
        hype: 9,
        physical: 7,
        concentration: 8
    },
    {
        name: 'Drum Shaman',
        imageFile: 'drum-shaman.jpg',
        description: 'Keeper of the rhythm, channeling primal beats that move body and soul.',
        hype: 7,
        physical: 9,
        concentration: 6
    },
    {
        name: 'Synth Wizard',
        imageFile: 'synth-wizard.jpg',
        description: 'Digital sorcerer crafting electronic soundscapes and futuristic melodies.',
        hype: 8,
        physical: 5,
        concentration: 9
    },
    {
        name: 'Vocal Legend',
        imageFile: 'vocal-legend.jpg',
        description: 'Voice that can shake mountains and soothe storms, commanding attention.',
        hype: 10,
        physical: 6,
        concentration: 7
    },
    {
        name: 'DJ Master',
        imageFile: 'dj-master.jpg',
        description: 'Mix maestro who can read the crowd and keep the energy flowing all night.',
        hype: 9,
        physical: 7,
        concentration: 8
    },
    {
        name: 'Brass King',
        imageFile: 'brass-king.jpg',
        description: 'Ruler of horns, bringing royal fanfare and soulful jazz to any stage.',
        hype: 8,
        physical: 8,
        concentration: 7
    },
    {
        name: 'String Queen',
        imageFile: 'string-queen.jpg',
        description: 'Violin virtuoso who can make strings sing with elegance and passion.',
        hype: 7,
        physical: 6,
        concentration: 9
    }
];

async function createTestCards(userId) {
    try {
        // Delete existing cards for this user
        await Card.deleteMany({ owner: userId });

        const cards = [];
        
        for (const cardData of MUSIC_CARDS) {
            const card = new Card({
                ...cardData,
                owner: userId,
                forSale: false
            });
            await card.save();
            cards.push(card);
        }
        
        console.log(`Created ${cards.length} cards for user ${userId}`);
        return cards;
    } catch (error) {
        console.error('Error creating test cards:', error);
        throw error;
    }
}

// If running this script directly
if (require.main === module) {
    const testUserId = process.argv[2];
    if (!testUserId) {
        console.error('Please provide a user ID as an argument');
        process.exit(1);
    }

    mongoose.connect(MONGODB_URI)
        .then(() => createTestCards(testUserId))
        .then(() => {
            console.log('Test cards created successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

module.exports = { createTestCards, MUSIC_CARDS };
