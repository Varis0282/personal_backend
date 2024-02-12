const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();
const Mongo_URI = process.env.Mongo_URI;
const port = process.env.PORT;

mongoose.connect(Mongo_URI)
    .then(() => {
        console.log('Connected to the database');
        try {
            app.listen(3000, () => {
                console.log('Server is running on port 3000');
            });
        } catch (err) {
            console.log('Error starting the server');
        }
    })
    .catch((err) => {
        console.log('Error connecting to the database');
    });