const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', listingSchema);
