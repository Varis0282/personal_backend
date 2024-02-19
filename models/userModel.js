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
    doubts: [
        {
            question: {
                type: String,
            },
            answer: {
                type: String,
            },
            requery: [
                {
                    type: String,
                }
            ],
            status: {
                type: String,
                enum: ['pending', 'answered', 'dismissed', 'answered but not satisfied', 'dismissed but not satisfied', 'resolved'],
                default: 'pending',
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            update: {
                updatedAt: {
                    type: Date,
                },
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                },
                updateType: {
                    type: Enumerator,
                    enum: ['answered', 'dismissed', 'answered but not satisfied', 'dismissed but not satisfied', 'resolved'],
                }
            },
        }
    ],
    classes: [
        {
            classId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Class'
            },
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        }
    ],
    profilePic: {
        type: String,
    },
});

module.exports = mongoose.model('User', userSchema);
