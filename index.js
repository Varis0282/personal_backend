const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const db = require('./dbconfig');
const authRoutes = require('./routes/auth_route');
const userRoutes = require('./routes/user_routes');
const adminRoutes = require('./routes/admin_routes');

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', userRoutes);
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});