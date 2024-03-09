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
        // not send user password
        users.forEach(u => u.password = undefined);
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

// Class API

// add class in a class model by admin only and then save it's id in course model
router.post('/courses/:id/class', adminResources, async (req, res) => {
    const { timings, link, status } = req.body;
    if (!timings || !link || !status) {
        return res.status(401).json({ message: "Enter all required feilds", success: false });
    }
    try {
        const courseExists = await Course.findById(req.params.id);
        if (!courseExists) {
            return res.status(404).json({ message: "Course not found", success: false });
        }
        const newClass = new Class({
            course: req.params.id,
            timings,
            link,
            status,
            createdAt: Date.now(),
            createdBy: req.admin._id,
        });
        await newClass.save();
        courseExists.classes.push(newClass._id);
        await courseExists.save();
        res.status(201).json({
            success: true,
            data: newClass
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// get all classDetails of a course by course id from class model
router.get('/courses/:id/class', adminResources, async (req, res) => {
    try {
        const classes = await Class.find({ course: req.params.id })
        res.status(200).json({ data: classes, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// delete a class by admin only by class id
router.delete('/class/:id', adminResources, async (req, res) => {
    try {
        const classExists = await Class.findById(req.params.id);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found", success: false });
        }

        await classExists.remove();
        res.status(200).json({
            success: true,
            message: 'Class deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// update a class by admin only by class id
router.put('/class/:id', adminResources, async (req, res) => {
    const { course, timings, link, status, updatedBy, updateType } = req.body;
    try {
        const classExists = await Class.findById(req.params.id);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found", success: false });
        }

        classExists.course = course || classExists.course;
        classExists.timings = timings || classExists.timings;
        classExists.link = link || classExists.link;
        classExists.status = status || classExists.status;
        classExists.updatedBy = updatedBy || classExists.updatedBy;
        classExists.updateType = updateType || classExists.updateType;

        await classExists.save();
        res.status(200).json({
            success: true,
            data: classExists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// Doubts API

// get all the doubts in all the users with their details
router.get('/doubts', adminResources, async (req, res) => {
    try {
        const users = await User.find().populate('doubts.course');
        // send only user id, name, email, phone, doubts
        const data = users.map(u => {
            return {
                id: u._id,
                name: u.name,
                email: u.email,
                phone: u.phone,
                doubts: u.doubts
            }
        });
        res.status(200).json({ data: data, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all the doubts in a specific user by user id
router.get('/doubts/:userId', adminResources, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('doubts.course');
        res.status(200).json({ data: user.doubts, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all the doubts in a specific course by course id
router.get('/doubts/:courseId', adminResources, async (req, res) => {
    try {
        const users = await User.find().populate('doubts.course');
        const doubts = users.filter(u => u.doubts.course === req.params.courseId);
        res.status(200).json({ data: doubts, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// answer a doubt asked by user by admin only
router.put('/doubts/:doubtId/:userId', adminResources, async (req, res) => {
    const { answer, status, update, reanswer } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const doubt = user.doubts.id(req.params.doubtId);
        if (!doubt) {
            return res.status(404).json({ message: "Doubt not found", success: false });
        }
        doubt.answer = answer || doubt.answer;
        doubt.status = status || doubt.status;
        doubt.update = update || doubt.update;
        doubt.reanswer = reanswer || doubt.reanswer;
        await user.save();
        res.status(200).json({ message: 'Doubt answered successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

module.exports = router;