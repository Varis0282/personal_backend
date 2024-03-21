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
                name: "Mere Personal Guru",
                address: userMail,
            },
            to: user.email,
            subject: `OTP verification for Mere Personal Guru`,
            html: `<div style="margin: 0; padding: 0">
      <div
        style="
          background-color: #16143f;
          text-align: center;
          padding: 6px;
          border-radius: 4px 4px 0 0;
        "
      >
        <h1
          style="
            color: white;
            font-weight: bold;
            margin-bottom: 0;
            margin-top: 0;
          "
        >
          Mere Personal Guru
        </h1>
        <p
          style="
            color: #f97316;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 0;
          "
        >
          Apka Apna Online Tutor
        </p>
      </div>
      <div
        style="
          border: 1px solid black;
          border-top: 0;
          border-radius: 0 0 2px 2px;
          margin-top: 0;
          padding: 12px;
          font-size: 20px;
          font-weight: 500;
        "
      >
        Your OTP is ${otp} .<br/>Hello ${user.name} , We found that you've requested for OTP(One Time
        Password) . Here is your OTP . Note that , this OTP is valid for 15
        minutes only.<br />
        <br />
        <div
          style="display: flex; justify-content: center; align-items: center"
        >
          <div
            style="width: 15%; background-color: #f97316; text-align: center; padding: 12px; border-radius: 4px; color: white; font-size: 24px; font-weight: 600;"
          >
            ${otp}
          </div>
        </div>
        <br />
        Please do not share this OTP with anyone.<br />
        Thank you for using Mere Personal Guru.
        <br />
        <br />
        <br />
        Regards,
        <br />
        Technical Team
        <br />
        Mere Personal Guru
      </div>
    </div>`,
        }
        try {
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error);
                }
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