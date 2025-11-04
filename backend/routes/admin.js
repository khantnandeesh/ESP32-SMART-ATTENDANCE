const express = require('express');
const axios = require('axios');
const Student = require('../models/Student');

const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Get all photos by registration number (for future admin/attendance use)
router.get('/student-photos/:registrationNumber', async (req, res) => {
    try {
        const { registrationNumber } = req.params;

        const student = await Student.findOne({ registrationNumber });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            student: {
                name: student.name,
                email: student.email,
                registrationNumber: student.registrationNumber
            },
            photos: student.photos,
            photoCount: student.photos.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate face embeddings for a student
router.post('/generate-embeddings/:registrationNumber', async (req, res) => {
    try {
        const { registrationNumber } = req.params;

        const student = await Student.findOne({ registrationNumber });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (!student.hasPhotos || student.photos.length < 3) {
            return res.status(400).json({ error: 'Student must have at least 3 photos' });
        }

        // Call Python service to generate embeddings
        const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-embeddings`, {
            registrationNumber
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: error.message });
    }
});

// Verify face
router.post('/verify-face', async (req, res) => {
    try {
        const { imageUrl, registrationNumber } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Call Python service to verify face
        const response = await axios.post(`${PYTHON_SERVICE_URL}/verify-face`, {
            imageUrl,
            registrationNumber
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
