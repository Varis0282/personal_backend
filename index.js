const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/auth_route');
const userRoutes = require('./routes/user_routes');
const adminRoutes = require('./routes/admin_routes');
const cors = require('cors');
const mongoose = require('mongoose');
const Mongo_URI = process.env.Mongo_URI;
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('*', (req, res) => {
    res.status(404).json({ message: 'Api not found' });
});


mongoose.connect(Mongo_URI)
    .then(() => {
        console.log('Connected to the database');
        try {
            app.listen(port, () => {
                console.log(`Server is running on ${port}`);
            });
        } catch (err) {
            console.log('Error starting the server', err);
        }
    })
    .catch((err) => {
        console.log('Error connecting to the database');
    });