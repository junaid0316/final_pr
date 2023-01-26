const mongoose = require('mongoose');

const bookingsSchema = new mongoose.Schema({
    personName: {
        type: String,
        required: true
    },
    personCnic: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    personAddress: {
        type: String,
    },
    eventName: {
        type: String,
    },
    eventDate: {
        type: Date,
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    venue: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    partition: {
        type: String,
        required: true
    },
    noOfGuest: {
        type: String,
        required: true
    },
    bookingDescription: {
        type: String,
    },
    packages: {
        type: Array,
    },
    bookingRent: {
        type: String,
    },
    bookingDiscount: {
        type: String,
    },
    confirmed: {
        type: Number,
        required: true
    },
    bookingTotal: {
        type: String,
    },
    status: {
        type: Boolean,
        default: 1
    },
    userId: {
        type: mongoose.Types.ObjectId
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Bookings = mongoose.model('bookings', bookingsSchema);