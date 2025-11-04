const express = require('express');
const axios = require('axios');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Get current student profile
router.get('/me', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId).select('-__v -password');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            id: student._id,
            name: student.name,
            email: student.email,
            registrationNumber: student.registrationNumber,
            hasPhotos: student.hasPhotos,
            photoCount: student.photos.length,
            embeddingsGenerated: student.embeddingsGenerated,
            embeddingsCount: student.embeddingsCount,
            attendanceRecords: student.attendanceRecords || []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate embeddings for current student
router.post('/generate-embeddings', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (!student.hasPhotos || student.photos.length < 3) {
            return res.status(400).json({ error: 'You must upload at least 3 photos first' });
        }

        const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-embeddings`, {
            registrationNumber: student.registrationNumber
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
