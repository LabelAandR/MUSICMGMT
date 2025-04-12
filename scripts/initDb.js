const mongoose = require('mongoose');
const path = require('path');
const MONGODB_URI = 'mongodb+srv://tubsgpt:Capse77acyborg@mgmtdb.laof0ub.mongodb.net/?retryWrites=true&w=majority&appName=mgmtdb';
const Card = require('../models/Card');
const User = require('../models/User');
const Listing = require('../models/Listing');

async function initializeDatabase() {
    try {
        console.log('Connecting to MongoDB');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Card.deleteMany({});
        await Listing.deleteMany({});
        console.log('Cleared existing data');

        // Create initial cards
        const initialCards = [
            {
                name: "Soulful Singer",
                description: "A legendary vocalist whose soulful performances inspire the entire band.",
                imageFile: "/images/vocal-legend.jpg",
                physical: 6,
                concentration: 8,
                hype: 7,
                skill: {
                    name: "Inspiring Performance",
                    description: "Doubles the hype value of the next performer",
                    effect: "next_card_hype_multiplier_2x"
                },
                price: 1000
            },
            {
                name: "Guitar Sage",
                description: "A wise guitarist who channels ancient musical knowledge.",
                imageFile: "/images/guitar-mage.jpg",
                physical: 7,
                concentration: 9,
                hype: 8,
                skill: {
                    name: "Wisdom of the Strings",
                    description: "Increases all stats by 2 for the next performer",
                    effect: "next_card_stats_boost_2"
                },
                price: 1100
            },
            {
                name: "Drum Thunder",
                description: "A powerful drummer who commands the rhythm of storms.",
                imageFile: "/images/drum-shaman.jpg",
                physical: 9,
                concentration: 7,
                hype: 7,
                skill: {
                    name: "Thunder Strike",
                    description: "Adds your physical stat to your hype for this performance",
                    effect: "add_physical_to_hype"
                },
                price: 900
            },
            {
                name: "Bass Groove",
                description: "A funky bassist who keeps the crowd moving.",
                imageFile: "/images/bass.jpg",
                physical: 7,
                concentration: 8,
                hype: 6,
                skill: {
                    name: "Deep Rhythm",
                    description: "Your next two performers gain +3 hype",
                    effect: "next_two_cards_hype_boost_3"
                },
                price: 800
            },
            {
                name: "Dark Vocalist",
                description: "A mysterious singer with haunting melodies.",
                imageFile: "/images/vocal-legend.jpg",
                physical: 5,
                concentration: 9,
                hype: 8,
                skill: {
                    name: "Haunting Echo",
                    description: "Copies the previous performer's hype value",
                    effect: "copy_previous_hype"
                },
                price: 900
            }
        ];

        // Create test users
        const testUser = await User.create({
            username: 'TestUser',
            email: 'test@example.com',
            password: 'password123',
            currency: 10000
        });
        console.log('Created test user');

        const marketUser = await User.create({
            username: 'MarketBot',
            email: 'market@example.com',
            password: 'password123',
            currency: 100000
        });
        console.log('Created market bot user');

        // Create cards and listings
        for (const cardData of initialCards) {
            // Create a card for the test user
            const userCard = await Card.create({
                ...cardData,
                owner: testUser._id
            });
            console.log(`Added card to test user: ${cardData.name}`);

            // Create multiple cards for the market bot and list them
            for (let i = 0; i < 3; i++) {
                const marketCard = await Card.create({
                    ...cardData,
                    owner: marketUser._id
                });

                // List the card on the marketplace with varying prices
                const variance = Math.floor(Math.random() * 400) - 200; // Price variance of ±200
                await Listing.create({
                    card: marketCard._id,
                    seller: marketUser._id,
                    price: cardData.price + variance
                });
                console.log(`Listed ${cardData.name} on marketplace for ${cardData.price + variance}`);
            }
        }

        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
