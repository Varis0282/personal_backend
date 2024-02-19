const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    timings: {
        days: [{
            type: Enumerator,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        }],
        from: {
            type: Date,
        },
        to: {
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
    updateType: {
        type: Enumerator,
        enum: ['live', 'completed'],
    },
});

module.exports = mongoose.model('Class', classSchema);