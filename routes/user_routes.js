const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Class = require('../models/classModel');
const bcrypt = require('bcrypt');
const privateResources = require('../middleware/privateResources');


// get logged in user info by token
router.get('/', privateResources, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.password = undefined;
        res.status(200).json({ user: user, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// update user info only by logged in user
router.put('/update', privateResources, async (req, res) => {
    try {
        const { name, email, phone, city, college, branch, passoutYear, course, profilePic } = req.body;
        const user = await User.findById(req.user._id);
        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }
        if (phone) {
            user.phone = phone;
        }
        if (college) {
            user.college = college;
        }
        if (branch) {
            user.branch = branch;
        }
        if (passoutYear) {
            user.passoutYear = passoutYear;
        }
        if (course) {
            user.course = course;
        }
        if (profilePic) {
            user.profilePic = profilePic;
        }
        if (city) {
            user.city = city;
        }
        await user.save();
        res.status(200).json({ message: 'User updated successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// enroll in a course and add to user's courses and course's enrolledUsers
router.post('/enroll', privateResources, async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = await User.findById(req.user._id);
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found', success: false });
        }
        const isEnrolled = user.courses.find(c => c.id === courseId);
        if (isEnrolled) {
            return res.status(400).json({ message: 'Already enrolled', success: false });
        }
        // add course to user's courses and populate course's enrolledUsers
        user.courses.push({
            id: course._id,
            name: course.name,
            description: course.description,
            category: course.category,
            joinedAt: course.upcomingBatches[0].batchStartDate,
            expiredAt: course.upcomingBatches[0].batchEndDate
        });
        // get the class id from course.classes and fetch the class details from Class model and add to user's classes
        const classId = course.classes;
        const classDetails = await Class.findById(classId);
        user.classes.push({
            courseId: course._id,
            classId: classDetails._id,
        });
        // add user to course's enrolledUsers and populate user's courses
        course.enrolledUsers.push({
            userId: user._id,
            joinedAt: Date.now(),
        });
        await user.save();
        await course.save();
        res.status(200).json({ message: 'Enrolled successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all courses enrolled by logged in user
router.get('/courses', privateResources, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('courses.id','classes.classId');
        res.status(200).json({ data: user.courses, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// chamge password by logged in user after verifying email and old password
router.put('/change-password', privateResources, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password', success: false });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all courses without login
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find(); // assuming you have a Course model
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get a particular course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id); // assuming you have a Course model
        if (!course) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

//ask a doubt and save it in user's doubts
router.post('/doubt', privateResources, async (req, res) => {
    try {
        const { courseId, question } = req.body;
        const user = await User.findById(req.user._id);
        user.doubts.push({
            courseId: courseId,
            question: question,
            status: 'pending',
            createdAt: Date.now()
        });
        await user.save();
        res.status(200).json({ message: 'Doubt asked successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all doubts asked by logged in user
router.get('/doubts', privateResources, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('doubts.courseId');
        res.status(200).json({ data: user.doubts, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// get all doubts asked by logged in user for a particular course
router.get('/doubts/:courseId', privateResources, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('doubts.courseId');
        const doubts = user.doubts.filter(d => d.courseId === req.params.courseId);
        res.status(200).json({ data: doubts, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

// update a doubt status asked by logged in user
router.put('/doubt/:doubtId', privateResources, async (req, res) => {
    try {
        const { requery, status, update } = req.body;
        const user = await User.findById(req.user._id);
        const doubt = user.doubts.id(req.params.doubtId);
        if (!doubt) {
            return res.status(404).json({ message: 'Doubt not found', success: false });
        }
        if (requery) {
            doubt.requery = requery;
        }
        if (status) {
            doubt.status = status;
        }
        doubt.update = update;
        await user.save();
        res.status(200).json({ message: 'Doubt updated successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
});

module.exports = router;