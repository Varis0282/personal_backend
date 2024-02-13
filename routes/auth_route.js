const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const privateResources = require('../middleware/privateResources');
const nodemailer = require('nodemailer');
const userMail = process.env.USER_MAIL;
const userPassword = process.env.USER_PASSWORD;

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const user = await User.findOne({ $or: [{ email }, { name }, { password }, { phone }] });
        if (user) {
            if (user.email === email) {
                return res.status(400).json({ message: 'Email already exists', success: false });
            }
            if (user.name === name) {
                return res.status(400).json({ message: 'Name already exists', success: false });
            }
            if (user.phone === phone) {
                return res.status(400).json({ message: 'Phone already exists', success: false });
            }
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { key, password } = req.body;
        const user = await User.findOne({ $or: [{ email: key.toLowerCase() }, { phone: key }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credential', success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password', success: false });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const { password: userPassword, ...others } = user._doc;
        res.status(200).json({ token, user: others, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

router.post('/admin-login', async (req, res) => {
    try {
        const { key, password } = req.body;
        const user = await User.findOne({ $or: [{ email: key.toLowerCase() }, { phone: key }] });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credential', success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password', success: false });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        const { password: userPassword, ...others } = user._doc;
        res.status(200).json({ token, user: others, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
})

router.post('/send-otp-mail', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found', success: false });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: userMail,
                pass: userPassword,
            },
        });
        const mailOptions = {
            from: {
                name: "Test",
                address: userMail,
            },
            to: user.email,
            subject: `Hello ${user.name}`,
            text: `Hello ${user.name} , Your otp is ${otp}`,
            html: `<p>Hello ${user.name} , Your otp is ${otp}</p>`,
        }
        try {
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error);
                }
                console.log(`Message sent: ${info}`);
                user.lastOTPTime = Date.now();
                user.lastOTP = otp;
                await user.save();
                res.status(200).json({ message: 'OTP sent successfully', info: info, success: true });
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: error, success: false });
        }
    } catch (error) {
        console.log(error);
        console.log(error.message);
        res.status(500).json({ message: error, success: false });
    }
});

router.post('/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            lastOTP: otp
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP', success: false });
        }
        user.mailVerified = true;
        user.lastOTP = '';
        await user.save();
        res.status(200).json({ message: 'Email verified successfully', success: true, user: user });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// to implement phone verification in future

module.exports = router;