const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');

const router = express.Router();

// Sign In (Register)
router.post('/signin', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid college email is required'),
    body('registrationNumber').matches(/^\d{8}$/).withMessage('Registration number must be 8 digits'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, registrationNumber, password } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { registrationNumber }]
        });

        if (existingStudent) {
            return res.status(400).json({ error: 'Student already exists with this email or registration number' });
        }

        const student = new Student({ name, email, registrationNumber, password });
        await student.save();

        const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Sign in successful',
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                registrationNumber: student.registrationNumber,
                hasPhotos: student.hasPhotos
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', [
    body('registrationNumber').matches(/^\d{8}$/).withMessage('Registration number must be 8 digits'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { registrationNumber, password } = req.body;

        const student = await Student.findOne({ registrationNumber });
        if (!student) {
            return res.status(401).json({ error: 'Invalid registration number or password' });
        }

        const isPasswordValid = await student.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid registration number or password' });
        }

        const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                registrationNumber: student.registrationNumber,
                hasPhotos: student.hasPhotos
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
