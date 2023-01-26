const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({

    package_name: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 1,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

});

module.exports = Package = mongoose.model('packages', packageSchema);