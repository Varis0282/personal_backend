const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    numberOfEnrollments: {
        type: Number,
        default: 0
    },
    enrolledUsers: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    upcomingBatches: [
        {
            batchStartDate: {
                type: Date
            },
            batchEndDate: {
                type: Date
            }
        }
    ],
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    content: [
        {
            title: {
                type: String
            },
            description: {
                type: String
            },
            numberOfTopics: {
                type: Number,
                default: 0
            },
            topics: [
                {
                    name: {
                        type: String
                    },
                }
            ]
        }
    ],
    projects: [
        {
            title: {
                type: String
            },
            description: {
                type: String
            }
        }
    ],
    price: {
        type: Number,
        required: true
    },
    actualPrice: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Course', courseSchema);