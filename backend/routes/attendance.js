const express = require('express');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const AttendanceSession = require('../models/AttendanceSession');
const Student = require('../models/Student');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const ESP32_CAM_URL = 'http://10.255.12.208/capture';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Create new attendance session
router.post('/create-session', adminAuth, async (req, res) => {
    try {
        const { sessionName } = req.body;

        if (!sessionName) {
            return res.status(400).json({ error: 'Session name is required' });
        }

        const session = new AttendanceSession({
            sessionName,
            adminId: req.adminId,
            status: 'capturing'
        });

        await session.save();

        res.json({
            message: 'Session created',
            sessionId: session._id,
            sessionName: session.sessionName
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Capture photos from ESP32-CAM
router.post('/capture-photos/:sessionId', adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const capturedPhotos = [];
        const errors = [];

        // Capture 2 photos
        for (let i = 0; i < 2; i++) {
            try {
                // Capture from ESP32-CAM
                const response = await axios.get(ESP32_CAM_URL, {
                    params: { _cb: Date.now() },
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Origin': 'http://10.255.12.208',
                        'Referer': 'http://10.255.12.208/'
                    },
                    responseType: 'arraybuffer',
                    timeout: 10000
                });

                // Upload to Cloudinary
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: `attendance-sessions/${sessionId}`,
                            public_id: `photo_${i}_${Date.now()}`,
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(Buffer.from(response.data));
                });

                capturedPhotos.push({
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id
                });

                // Small delay between captures
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                errors.push({ photoIndex: i, error: error.message });
            }
        }

        if (capturedPhotos.length === 0) {
            return res.status(500).json({ error: 'Failed to capture any photos', errors });
        }

        // Update session with photos
        session.photos = capturedPhotos;
        session.totalPhotos = capturedPhotos.length;
        session.status = 'processing';
        await session.save();

        res.json({
            message: `Captured ${capturedPhotos.length} photos`,
            sessionId: session._id,
            totalPhotos: capturedPhotos.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Process attendance (recognize faces)
router.post('/process-session/:sessionId', adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.photos.length === 0) {
            return res.status(400).json({ error: 'No photos in session' });
        }

        session.status = 'processing';
        await session.save();

        // Process each photo for face recognition
        const recognizedStudentsMap = new Map();

        for (let i = 0; i < session.photos.length; i++) {
            const photo = session.photos[i];

            try {
                // Call Python service to recognize faces in photo
                const response = await axios.post(`${PYTHON_SERVICE_URL}/recognize-multiple-faces`, {
                    imageUrl: photo.url
                });

                if (response.data.faces && response.data.faces.length > 0) {
                    response.data.faces.forEach(face => {
                        if (face.verified && face.registrationNumber) {
                            const existing = recognizedStudentsMap.get(face.registrationNumber);

                            // Keep the best match (highest confidence)
                            if (!existing || face.confidence > existing.confidence) {
                                recognizedStudentsMap.set(face.registrationNumber, {
                                    registrationNumber: face.registrationNumber,
                                    name: face.name,
                                    confidence: face.confidence,
                                    bestPhotoUrl: photo.url,
                                    photoIndex: i
                                });
                            }
                        }
                    });
                }
            } catch (error) {
                console.error(`Error processing photo ${i}:`, error.message);
            }
        }

        // Convert map to array and get student IDs
        const recognizedStudents = [];
        for (const [regNum, data] of recognizedStudentsMap) {
            const student = await Student.findOne({ registrationNumber: regNum });
            if (student) {
                recognizedStudents.push({
                    studentId: student._id,
                    ...data
                });

                // Update student's attendance record
                if (!student.attendanceRecords) {
                    student.attendanceRecords = [];
                }
                student.attendanceRecords.push({
                    sessionId: session._id,
                    sessionName: session.sessionName,
                    photoUrl: data.bestPhotoUrl,
                    confidence: data.confidence,
                    markedAt: new Date()
                });
                await student.save();
            }
        }

        session.recognizedStudents = recognizedStudents;
        session.studentsRecognized = recognizedStudents.length;
        session.status = 'completed';
        await session.save();

        res.json({
            message: 'Attendance processed successfully',
            sessionId: session._id,
            totalPhotos: session.totalPhotos,
            studentsRecognized: recognizedStudents.length,
            students: recognizedStudents
        });
    } catch (error) {
        const session = await AttendanceSession.findById(req.params.sessionId);
        if (session) {
            session.status = 'failed';
            await session.save();
        }
        res.status(500).json({ error: error.message });
    }
});

// Get all sessions
router.get('/sessions', adminAuth, async (req, res) => {
    try {
        const sessions = await AttendanceSession.find()
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get session details
router.get('/session/:sessionId', adminAuth, async (req, res) => {
    try {
        const session = await AttendanceSession.findById(req.params.sessionId)
            .populate('recognizedStudents.studentId', 'name email registrationNumber');

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
