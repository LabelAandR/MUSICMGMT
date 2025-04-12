const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkUserCards() {
  try {
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    // Check each user's cards
    for (const user of users) {
      console.log(`\nChecking cards for ${user.username} (${user.email}):`);
      
      const cards = await Card.find({ owner: user._id });
      console.log(`Found ${cards.length} cards for this user.`);
      
      if (cards.length > 0) {
        console.log('Sample card:', {
          name: cards[0].name,
          imageFile: cards[0].imageFile,
          owner: cards[0].owner
        });
      } else {
        console.log('Creating a card for this user...');
        // Create a test card for this user
        const newCard = new Card({
          name: 'Soulful Singer',
          imageFile: '/images/vocal-legend.jpg',
          hype: 7,
          physical: 5, 
          concentration: 8,
          description: 'A legendary vocal performer',
          owner: user._id,
          skill: {
            name: 'Inspiring Performance',
            description: 'Doubles next performer\'s hype',
            effect: 'next_card_hype_multiplier_2x'
          }
        });
        
        await newCard.save();
        console.log('Created new card with ID:', newCard._id);
      }
    }
    
    console.log('\nCheck complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserCards();
