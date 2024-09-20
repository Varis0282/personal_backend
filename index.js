const express = require('express');
const app = express();
require('dotenv').config();
const authRoutes = require('./routes/auth_route');
const userRoutes = require('./routes/user_routes');
const adminRoutes = require('./routes/admin_routes');
const fileRoutes = require('./routes/file_routes');
const cors = require('cors');
const mongoose = require('mongoose');
const Mongo_URI = process.env.Mongo_URI;
const port = process.env.PORT;
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
const morgan = require('morgan');

app.use(express.json());
app.use(cors());

// Use morgan middleware with custom format
app.use(morgan('combined'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', userRoutes);
app.use('/api/file', fileRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('*', (req, res) => {
    res.status(404).json({ message: 'Api not found' });
});

const get = async () => {
    const result = await fetch('https://personal-backend-dnt0.onrender.com/')
    const result2 = await fetch('https://mere-personal-guru.onrender.com/')
    console.log(result);
    console.log(result2);
}

setInterval(() => {
    get();
}, 500000);


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
        console.log(err)
        console.log('Error connecting to the database');
    });
