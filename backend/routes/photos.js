const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Student = require('../models/Student');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload photos
router.post('/upload', auth, upload.array('photos', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 3) {
            return res.status(400).json({ error: 'Minimum 3 photos required' });
        }

        const student = await Student.findById(req.studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const uploadPromises = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `attendance-system/${student.registrationNumber}`,
                        public_id: `${student.registrationNumber}_${Date.now()}_${index}`,
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);

        const photos = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id
        }));

        student.photos.push(...photos);
        student.hasPhotos = true;
        await student.save();

        res.json({
            message: 'Photos uploaded successfully',
            photos: student.photos,
            hasPhotos: student.hasPhotos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student photos
router.get('/my-photos', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({
            photos: student.photos,
            hasPhotos: student.hasPhotos
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
