const express = require('express');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

const router = express.Router();

// Create subject
router.post('/create', adminAuth, async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required' });
        }

        const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
        if (existingSubject) {
            return res.status(400).json({ error: 'Subject code already exists' });
        }

        const subject = new Subject({
            name,
            code: code.toUpperCase(),
            description,
            adminId: req.adminId
        });

        await subject.save();

        res.status(201).json({
            message: 'Subject created successfully',
            subject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all subjects
router.get('/all', adminAuth, async (req, res) => {
    try {
        const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update subject
router.put('/:subjectId', adminAuth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        if (name) subject.name = name;
        if (description !== undefined) subject.description = description;

        await subject.save();

        res.json({
            message: 'Subject updated successfully',
            subject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete subject (soft delete)
router.delete('/:subjectId', adminAuth, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        subject.isActive = false;
        await subject.save();

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all active subjects (for student enrollment)
router.get('/available', auth, async (req, res) => {
    try {
        const subjects = await Subject.find({ isActive: true })
            .select('name code description totalEnrolled')
            .sort({ name: 1 });
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enroll student in subject
router.post('/enroll/:subjectId', auth, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId);
        const student = await Student.findById(req.studentId);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if already enrolled
        const alreadyEnrolled = subject.enrolledStudents.some(
            s => s.studentId.toString() === student._id.toString()
        );

        if (alreadyEnrolled) {
            return res.status(400).json({ error: 'Already enrolled in this subject' });
        }

        // Add to subject's enrolled students
        subject.enrolledStudents.push({
            studentId: student._id,
            registrationNumber: student.registrationNumber,
            name: student.name,
            email: student.email
        });
        subject.totalEnrolled = subject.enrolledStudents.length;
        await subject.save();

        // Add to student's enrolled subjects
        if (!student.enrolledSubjects) {
            student.enrolledSubjects = [];
        }
        student.enrolledSubjects.push({
            subjectId: subject._id,
            subjectName: subject.name,
            subjectCode: subject.code
        });
        await student.save();

        res.json({
            message: 'Successfully enrolled in subject',
            subject: {
                id: subject._id,
                name: subject.name,
                code: subject.code
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unenroll student from subject
router.post('/unenroll/:subjectId', auth, async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId);
        const student = await Student.findById(req.studentId);

        if (!subject || !student) {
            return res.status(404).json({ error: 'Subject or student not found' });
        }

        // Remove from subject's enrolled students
        subject.enrolledStudents = subject.enrolledStudents.filter(
            s => s.studentId.toString() !== student._id.toString()
        );
        subject.totalEnrolled = subject.enrolledStudents.length;
        await subject.save();

        // Remove from student's enrolled subjects
        student.enrolledSubjects = student.enrolledSubjects.filter(
            s => s.subjectId.toString() !== subject._id.toString()
        );
        await student.save();

        res.json({ message: 'Successfully unenrolled from subject' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student's enrolled subjects
router.get('/my-enrollments', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId)
            .populate('enrolledSubjects.subjectId', 'name code description');

        res.json({
            enrolledSubjects: student.enrolledSubjects || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
