const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const adminResources = require('../middleware/privateResourcesAdmin');
const Course = require('../models/courseModel');
const Class = require('../models/classModel');


// Users API


// Get all users
router.get('/users', adminResources, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users: users, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all courses enrolled by a specific user by user id
router.get('/user/:id', adminResources, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        const courses = await Course.find({ enrolledUsers: { $elemMatch: { userId: req.params.id } } });
        res.status(200).json({ courses: courses, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// delete a user by admin only
router.delete('/users/:id', adminResources, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        await user.remove();
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// update a user by admin only
router.put('/user/:id', adminResources, async (req, res) => {
    const { name, email, password, lastOTP } = req.body;
    try {
        const user = await User.findById(req.params.id); // assuming you have a User model
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.password = password || user.password;
        user.lastOTP = lastOTP || user.lastOTP;

        await user.save();
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});


// Courses API


// Get all courses
router.get('/courses', adminResources, async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ courses: courses, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all user enrolled in a specific course by course id
router.get('/course/:id', adminResources, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found', success: false });
        }
        const users = await User.find({ courses: { $elemMatch: { id: req.params.id } } });
        res.status(200).json({ users: users, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// add a course by admin only
router.post('/courses', adminResources, async (req, res) => {
    const { name, description, duration, upcomingBatches, content, projects, price, actualPrice } = req.body;
    // if name description duration not present
    if (!name || !description || !duration || !price || !actualPrice) {
        return res.status(401).json({ message: "Enter all required feilds", success: false });
    }
    try {
        const course = new Course({
            name,
            description,
            duration,
            upcomingBatches,
            content,
            projects,
            price,
            actualPrice
        });
        await course.save();
        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// update a course by admin only
router.put('/courses/:id', adminResources, async (req, res) => {
    const { name, description, duration, upcomingBatches, content, projects, price, actualPrice } = req.body;
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        course.name = name || course.name;
        course.description = description || course.description;
        course.duration = duration || course.duration;
        course.upcomingBatches = upcomingBatches || course.upcomingBatches;
        course.content = content || course.content;
        course.projects = projects || course.projects;
        course.price = price || course.price;
        course.actualPrice = actualPrice || course.actualPrice;

        await course.save();
        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// delete a course by admin only
router.delete('/courses/:id', adminResources, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        await course.remove();
        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// add class in a class model by admin only and then save it's id in course model
router.post('/courses/:id/class', adminResources, async (req, res) => {
    const { course, timings, link, status, updatedBy, updateType } = req.body;
    try {
        const newClass = new Class({
            course,
            timings,
            link,
            status,
            updatedBy,
            updateType
        });
        await newClass.save();
        const courseExists = await Course.findById(req.params.id);
        courseExists.classes.push(newClass._id);
        await courseExists.save();
        res.status(201).json({
            success: true,
            data: newClass
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});


module.exports = router;