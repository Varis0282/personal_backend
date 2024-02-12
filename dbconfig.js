const mongoose = require('mongoose');
require('dotenv').config();
const Mongo_URI = process.env.Mongo_URI;

mongoose.connect(Mongo_URI)
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((err) => {
        console.log('Error connecting to the database');
    });