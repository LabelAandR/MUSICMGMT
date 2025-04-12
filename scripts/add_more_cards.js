require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');
const User = require('../models/User');
const Listing = require('../models/Listing');

const additionalCards = [
    {
        name: "Rock Star",
        description: "A high-energy performer who knows how to work the crowd",
        imageFile: "guitar-mage.jpg",
        hype: 8,
        physical: 7,
        concentration: 6
    },
    {
        name: "Jazz Virtuoso",
        description: "Master of improvisation and smooth melodies",
        imageFile: "brass-king.jpg", // Fixed image
        hype: 7,
        physical: 5,
        concentration: 9
    },
    {
        name: "EDM Producer",
        description: "Electronic music wizard with killer beats",
        imageFile: "dj-master.jpg",
        hype: 8,
        physical: 6,
        concentration: 8
    },
    {
        name: "Classical Pianist",
        description: "Elegant and precise, brings sophistication to any show",
        imageFile: "string-queen.jpg",
        hype: 6,
        physical: 7,
        concentration: 9
    },
    {
        name: "Pop Diva",
        description: "Chart-topping sensation with a powerful voice",
        imageFile: "vocal-legend.jpg",
        hype: 9,
        physical: 8,
        concentration: 7
    },
    {
        name: "Rap Artist",
        description: "Lyrical genius with unmatched flow",
        imageFile: "synth-wizard.jpg",
        hype: 9,
        physical: 7,
        concentration: 8
    },
    {
        name: "Folk Singer",
        description: "Storyteller with a soulful acoustic sound",
        imageFile: "bass.jpg",
        hype: 6,
        physical: 5,
        concentration: 8
    },
    {
        name: "Metal Guitarist",
        description: "Shredding master of heavy riffs",
        imageFile: "drum-shaman.jpg",
        hype: 8,
        physical: 8,
        concentration: 8
    }
];

async function clearExistingData() {
    console.log('Clearing existing cards and listings...');
    await Card.deleteMany({});
    await Listing.deleteMany({});
}

async function addMoreCards() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await clearExistingData();

        // Get test accounts
        const testAccounts = await User.find({
            email: { $in: ['rockstar@test.com', 'jazz@test.com', 'beats@test.com'] }
        });

        if (testAccounts.length === 0) {
            console.log('No test accounts found!');
            return;
        }

        // Create cards for each account
        for (const user of testAccounts) {
            console.log(`Creating cards for ${user.email}`);
            
            // Create 5-6 random cards for each user
            const numCards = Math.floor(Math.random() * 2) + 5; // 5-6 cards
            const userCards = [];

            // Make sure each user gets at least one of each type
            const shuffledCards = [...additionalCards].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numCards; i++) {
                const cardTemplate = shuffledCards[i % shuffledCards.length];
                const card = new Card({
                    ...cardTemplate,
                    owner: user._id
                });
                await card.save();
                userCards.push(card);
                console.log(`Created card: ${card.name} for ${user.email}`);
            }

            // List 3-4 cards from each user
            const numListings = Math.floor(Math.random() * 2) + 3; // 3-4 listings
            const shuffledUserCards = [...userCards].sort(() => Math.random() - 0.5);
            for (let i = 0; i < numListings && i < shuffledUserCards.length; i++) {
                const card = shuffledUserCards[i];
                const price = Math.floor(Math.random() * 5000) + 2000; // 2000-7000 price

                const listing = new Listing({
                    card: card._id,
                    seller: user._id,
                    price
                });
                await listing.save();

                // Update card's forSale status
                card.forSale = true;
                await card.save();

                console.log(`Listed ${card.name} for ${price} by ${user.email}`);
            }
        }

        console.log('Successfully added more cards and listings');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

addMoreCards();
