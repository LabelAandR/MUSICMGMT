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
                name: 'Soulful Singer',
                imageFile: '/images/vocals good.jpg',
                hype: 8,
                physical: 2,
                concentration: 3,
                description: 'A powerful voice that resonates with the audience',
                price: 1000
            },
            {
                name: 'Dark Vocalist',
                imageFile: '/images/vocals evil.jpg',
                hype: 7,
                physical: 1,
                concentration: 4,
                description: 'Haunting melodies that captivate listeners',
                price: 900
            },
            {
                name: 'Bass Groove',
                imageFile: '/images/bass.jpg',
                hype: 6,
                physical: 2,
                concentration: 2,
                description: 'Lays down an irresistible rhythm',
                price: 800
            },
            {
                name: 'Drum Thunder',
                imageFile: '/images/drums good.jpg',
                hype: 7,
                physical: 3,
                concentration: 2,
                description: 'Drives the beat with explosive energy',
                price: 950
            },
            {
                name: 'Guitar Sage',
                imageFile: '/images/guitar mage.jpg',
                hype: 8,
                physical: 2,
                concentration: 3,
                description: 'Weaves magical melodies through the air',
                price: 1100
            },
            {
                name: 'Guitar Warrior',
                imageFile: '/images/guitar ninja.jpg',
                hype: 7,
                physical: 3,
                concentration: 2,
                description: 'Shreds with lightning-fast precision',
                price: 1000
            },
            {
                name: 'Soul Weaver',
                imageFile: '/images/Soulful Evocation.jpg',
                hype: 10,
                physical: 3,
                concentration: 4,
                description: 'Creates transcendent musical experiences',
                price: 1500
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
