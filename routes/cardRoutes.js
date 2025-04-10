const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const auth = require('../middleware/auth');

// Get all cards for a user
router.get('/mycards', auth, async (req, res) => {
    try {
        const cards = await Card.find({ owner: req.user.userId });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cards', error: error.message });
    }
});

// Get a specific card
router.get('/:id', auth, async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching card', error: error.message });
    }
});

// Update a card (e.g., change description)
router.patch('/:id', auth, async (req, res) => {
    try {
        const card = await Card.findOne({ _id: req.params.id, owner: req.user.userId });
        if (!card) {
            return res.status(404).json({ message: 'Card not found or not owned by user' });
        }

        const allowedUpdates = ['description'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => card[update] = req.body[update]);
        await card.save();
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: 'Error updating card', error: error.message });
    }
});

// Create a new card
router.post('/', auth, async (req, res) => {
    try {
        const cardData = {
            ...req.body,
            owner: req.user.userId,
            imageFile: 'default.jpg',  // Using a default image
            hype: Math.floor(Math.random() * 100),
            physical: Math.floor(Math.random() * 100),
            concentration: Math.floor(Math.random() * 100)
        };

        const card = new Card(cardData);
        await card.save();
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: 'Error creating card', error: error.message });
    }
});

module.exports = router;
