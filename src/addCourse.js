const express = require('express');
const addCourse = express.Router();
const multer = require("multer");
const { courseModel } = require('./modal/courses_add');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './upload');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = uniqueSuffix + '-' + file.originalname;
        cb(null, filename);
    }
});

var upload = multer({ storage: storage });

require("dotenv/config");

// Add Course
addCourse.post('/addCourse', upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file.path;

        const newCourse = new courseModel({ name, description, image });
        await newCourse.save();

        res.status(201).json({
            message: "Course added successfully",
            data: newCourse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});

// Update Course
addCourse.put('/updateCourse/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        let updateData = { name, description };

        // Check if image is uploaded
        if (req.file) {
            updateData.image = req.file.path;
        }

        // Find course by ID and update
        const updatedCourse = await courseModel.findByIdAndUpdate(id, updateData, { new: true });

        // Check if course was found and updated
        if (updatedCourse) {
            res.status(200).json({
                message: "Course updated successfully",
                data: updatedCourse
            });
        } else {
            res.status(404).json({
                message: "Course not found"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});

// Get all Courses
addCourse.get('/allCourses', async (req, res) => {
    try {
        const courses = await courseModel.find();
        console.log(courses)
        res.status(200).json({
            message: "All courses fetched successfully",
            data: courses
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});

// Delete Course
addCourse.delete('/deleteCourse/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await courseModel.findByIdAndDelete(id);

        if (deletedCourse) {
            res.status(200).json({
                message: "Course deleted successfully",
                data: deletedCourse
            });
        } else {
            res.status(404).json({
                message: "Course not found"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
});

module.exports = { addCourse };
