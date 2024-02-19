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
    college: {
        type: String,
    },
    branch: {
        type: String,
    },
    specialization: {
        type: String,
    },
    passoutYear: {
        type: String,
    },
    doubts:[
        {
            question: {
                type: String,
            },
            answer: {
                type: String,
            },
            status: {
                type: Enumerator,
                enum: ['pending', 'answered', 'dismissed', 'answered but not satisfied', 'dismissed but not satisfied', 'resolved'],
                default: 'pending'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            update:{
                updatedAt: {
                    type: Date,
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                updateType:{
                    type: Enumerator,
                    enum: ['answered', 'dismissed', 'answered but not satisfied', 'dismissed but not satisfied', 'resolved'],
                }
            },
        }
    ],
    classes: [
        {
            course:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            timings:{
                days:[{
                    type: Enumerator,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                }],
                from:{
                    type: Date,
                },
                to:{
                    type: Date,
                }
            },
            link: {
                type: String,
            },
            status: {
                type: Enumerator,
                enum: ['upcoming', 'live', 'completed'],
                default: 'upcoming'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            updateType:{
                type: Enumerator,
                enum: ['live', 'completed'],
            },
        }
    ],
    profilePic: {
        type: String,
    },
});

module.exports = mongoose.model('User', userSchema);
