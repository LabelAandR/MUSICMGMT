require('dotenv').config();
const mongoose = require('mongoose');
const Card = require('../models/Card');
const User = require('../models/User');
const Listing = require('../models/Listing');

const ORIGINAL_CARDS = [
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
        }
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
        }
    },
    {
        name: "Drum Thunder",
        description: "A powerful drummer who commands the stage with thunderous beats.",
        imageFile: "/images/drum-shaman.jpg",
        physical: 9,
        concentration: 7,
        hype: 8,
        skill: {
            name: "Rhythmic Force",
            description: "Adds +3 to physical stat of all performers",
            effect: "all_cards_physical_boost_3"
        }
    },
    {
        name: "Dark Vocalist",
        description: "A mysterious singer with haunting melodies that entrance the audience.",
        imageFile: "/images/vocal-legend.jpg",
        physical: 5,
        concentration: 9,
        hype: 8,
        skill: {
            name: "Haunting Melody",
            description: "Increases concentration of all performers by 2",
            effect: "all_cards_concentration_boost_2"
        }
    }
];

async function restoreMarketplace() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing listings
        await Listing.deleteMany({});
        console.log('Cleared existing listings');

        // Get all users
        const users = await User.find({});
        if (users.length === 0) {
            console.log('No users found!');
            return;
        }

        // Create cards and listings
        for (const cardTemplate of ORIGINAL_CARDS) {
            // Randomly select a user to own and list the card
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            // Create the card
            const card = new Card({
                ...cardTemplate,
                owner: randomUser._id
            });
            await card.save();
            console.log(`Created card: ${card.name} for ${randomUser.email}`);

            // Create a listing with a random price between 500 and 2000
            const price = Math.floor(Math.random() * 1500) + 500;
            const listing = new Listing({
                card: card._id,
                seller: randomUser._id,
                price: price
            });
            await listing.save();
            console.log(`Listed ${card.name} for ${price} gold by ${randomUser.email}`);
        }

        console.log('Successfully restored marketplace with original cards');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

restoreMarketplace();
