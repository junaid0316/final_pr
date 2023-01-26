const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    packages: [{
        type: mongoose.Types.ObjectId,
        ref: "packages"
    }],
    partition: {
        type: Array,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    gallery: {
        type: Array,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    geometery: {
        type: Object,
        required: true
    },
    itemPriority: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    activeStatus: {
        type: Boolean,
        default: true
    }
});

module.exports = Property = mongoose.model('properties', propertySchema);