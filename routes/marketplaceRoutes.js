const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Card = require('../models/Card');
const User = require('../models/User');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Get all cards available for sale
router.get('/listings', auth, async (req, res) => {
    try {
        const listings = await Listing.find()
            .populate('card')
            .populate('seller', 'username');
        
        console.log('Sending listings:', listings);
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Error fetching marketplace listings', error: error.message });
    }
});

// List a card for sale
router.post('/list/:cardId', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { price } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Valid price required' });
        }

        const card = await Card.findOne({ _id: req.params.cardId, owner: req.user.userId });
        if (!card) {
            return res.status(404).json({ message: 'Card not found or not owned by user' });
        }

        // Check if card is already listed
        const existingListing = await Listing.findOne({ card: card._id });
        if (existingListing) {
            return res.status(400).json({ message: 'Card is already listed for sale' });
        }

        // Create a new listing
        const listing = new Listing({
            card: card._id,
            seller: req.user.userId,
            price
        });
        await listing.save({ session });

        // Update card's forSale status
        card.forSale = true;
        await card.save({ session });

        await session.commitTransaction();

        const populatedListing = await Listing.findById(listing._id)
            .populate('card')
            .populate('seller', 'username');

        res.json(populatedListing);
    } catch (error) {
        await session.abortTransaction();
        console.error('Error listing card:', error);
        res.status(500).json({ message: 'Error listing card', error: error.message });
    } finally {
        session.endSession();
    }
});

// Remove card from sale
router.post('/delist/:listingId', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const listing = await Listing.findOne({ _id: req.params.listingId, seller: req.user.userId })
            .populate('card');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or not owned by user' });
        }

        // Update card's forSale status
        if (listing.card) {
            listing.card.forSale = false;
            await listing.card.save({ session });
        }

        // Use deleteOne instead of remove
        await Listing.deleteOne({ _id: listing._id }, { session });
        
        await session.commitTransaction();
        res.json({ message: 'Listing removed successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error delisting card:', error);
        res.status(500).json({ message: 'Error delisting card', error: error.message });
    } finally {
        session.endSession();
    }
});

// Buy a card
router.post('/buy/:listingId', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const listing = await Listing.findById(req.params.listingId)
            .populate('card')
            .populate('seller')
            .session(session);

        if (!listing) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if buyer is trying to buy their own card
        if (listing.seller._id.toString() === req.user.userId) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cannot buy your own card' });
        }

        const buyer = await User.findById(req.user.userId).session(session);
        if (!buyer) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Buyer not found' });
        }

        if (buyer.currency < listing.price) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Update card ownership
        const card = await Card.findById(listing.card._id).session(session);
        if (!card) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Card not found' });
        }

        card.owner = buyer._id;
        card.forSale = false;
        await card.save({ session });

        // Transfer currency
        buyer.currency -= listing.price;
        await buyer.save({ session });

        const seller = await User.findById(listing.seller._id).session(session);
        if (!seller) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Seller not found' });
        }

        seller.currency += listing.price;
        await seller.save({ session });

        // Remove the listing
        await Listing.findByIdAndDelete(listing._id, { session });

        await session.commitTransaction();
        console.log('Purchase successful:', {
            cardId: card._id,
            newOwner: buyer._id,
            price: listing.price
        });
        res.json({ 
            message: 'Card purchased successfully', 
            currency: buyer.currency,
            cardId: card._id
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Error buying card:', error);
        res.status(500).json({ message: 'Error buying card', error: error.message });
    } finally {
        session.endSession();
    }
});

// Get user's listings
router.get('/my-listings', auth, async (req, res) => {
    try {
        const listings = await Listing.find({ seller: req.user.userId })
            .populate('card');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user listings', error: error.message });
    }
});

module.exports = router;
