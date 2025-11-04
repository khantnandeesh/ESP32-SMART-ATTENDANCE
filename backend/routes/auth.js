const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { generateOTP, sendOTPEmail, validateMNNITEmail } = require('../config/emailOTP');

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map(); // { email: { otp, expiresAt, userData } }

// Step 1: Request OTP for registration
router.post('/request-otp', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Validate MNNIT email format
        const emailValidation = validateMNNITEmail(email);
        if (!emailValidation.isValid) {
            return res.status(400).json({ error: emailValidation.error });
        }

        const registrationNumber = emailValidation.registrationNumber;

        // Check if student already exists
        const existingStudent = await Student.findOne({
            $or: [{ email }, { registrationNumber }]
        });

        if (existingStudent) {
            return res.status(400).json({ 
                error: 'Student already exists with this email or registration number' 
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP and user data temporarily
        otpStore.set(email, {
            otp,
            expiresAt,
            userData: { name, email, registrationNumber, password },
            attempts: 0
        });

        // Send OTP email
        await sendOTPEmail(email, name, otp);

        res.json({
            message: 'OTP sent successfully to your email',
            email,
            registrationNumber,
            expiresIn: 600 // 10 minutes in seconds
        });

    } catch (error) {
        console.error('OTP request error:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// Step 2: Verify OTP and complete registration
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').matches(/^\d{6}$/).withMessage('OTP must be 6 digits')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp } = req.body;

        // Check if OTP exists
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ error: 'OTP not found or expired. Please request a new OTP.' });
        }

        // Check if OTP expired
        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
        }

        // Check attempts
        if (otpData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            otpStore.set(email, otpData);
            return res.status(400).json({ 
                error: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.` 
            });
        }

        // OTP is valid - create student account
        const { name, email: userEmail, registrationNumber, password } = otpData.userData;

        const student = new Student({ 
            name, 
            email: userEmail, 
            registrationNumber, 
            password 
        });
        await student.save();

        // Clear OTP from store
        otpStore.delete(email);

        // Generate JWT token
        const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Registration successful',
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
        console.error('OTP verification error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Resend OTP
router.post('/resend-otp', [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Check if OTP exists
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ error: 'No pending registration found. Please start registration again.' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Update OTP data
        otpData.otp = otp;
        otpData.expiresAt = expiresAt;
        otpData.attempts = 0;
        otpStore.set(email, otpData);

        // Send OTP email
        await sendOTPEmail(email, otpData.userData.name, otp);

        res.json({
            message: 'OTP resent successfully',
            expiresIn: 600
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
    }
});

// Login (unchanged)
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

// Cleanup expired OTPs (run periodically)
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiresAt) {
            otpStore.delete(email);
        }
    }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = router;