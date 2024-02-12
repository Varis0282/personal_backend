const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    mailVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    courses: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            name: {
                type: String,
            },
            description: {
                type: String,
            },
            category: {
                type: String,
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            expiredAt: {
                type: Date,
            }
        }
    ],
    role: {
        type: String,
        default: 'user'
    },
    lastOTP: {
        type: String,
    },
    lastOTPTime: {
        type: Date,
    },
    lastPurchase: {
        type: Date,
    },
    lastLogin: {
        type: Date,
    },
});

module.exports = mongoose.model('User', userSchema);
