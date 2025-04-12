const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageFile: {
        type: String,
        required: true
    },
    hype: {
        type: Number,
        required: true
    },
    physical: {
        type: Number,
        required: true
    },
    concentration: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    skill: {
        name: {
            type: String,
            default: null
        },
        description: {
            type: String,
            default: null
        },
        effect: {
            type: String,
            default: null
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    forSale: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Card', cardSchema);
