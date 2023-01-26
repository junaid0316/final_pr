const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Customers = mongoose.model('customer', customerSchema);