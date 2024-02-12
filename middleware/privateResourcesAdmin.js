const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Admin not found' });
        }
        if (user.role !== 'admin') {
            return res.status(401).json({ message: 'You have to be admin to access this' });
        }
        req.admin = user;
        next();
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}