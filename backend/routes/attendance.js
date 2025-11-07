const express = require('express');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');
const AttendanceSession = require('../models/AttendanceSession');
const Student = require('../models/Student');
<<<<<<< HEAD
const adminAuth = require('../middleware/adminAuth');
=======
const Subject = require('../models/Subject');
const adminAuth = require('../middleware/adminAuth');
const { sendAttendanceEmail, sendAbsentEmail } = require('../services/emailService');
>>>>>>> harsh_sharma

const router = express.Router();

const ESP32_CAM_URL = 'http://10.255.12.208/capture';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';

// Create new attendance session
router.post('/create-session', adminAuth, async (req, res) => {
    try {
<<<<<<< HEAD
        const { sessionName } = req.body;

        if (!sessionName) {
            return res.status(400).json({ error: 'Session name is required' });
        }

        const session = new AttendanceSession({
            sessionName,
            adminId: req.adminId,
            status: 'capturing'
=======
        const { subjectId, startTime, endTime } = req.body;

        if (!subjectId || !startTime || !endTime) {
            return res.status(400).json({ error: 'Subject, start time, and end time are required' });
        }

        const Subject = require('../models/Subject');
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        const sessionName = `${subject.name} - ${start.toLocaleDateString()} ${start.toLocaleTimeString()}`;

        const session = new AttendanceSession({
            sessionName,
            subjectId: subject._id,
            subjectName: subject.name,
            subjectCode: subject.code,
            adminId: req.adminId,
            startTime: start,
            endTime: end,
            status: 'active'
>>>>>>> harsh_sharma
        });

        await session.save();

        res.json({
            message: 'Session created',
<<<<<<< HEAD
            sessionId: session._id,
            sessionName: session.sessionName
=======
            session: {
                id: session._id,
                sessionName: session.sessionName,
                subjectName: session.subjectName,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status
            }
>>>>>>> harsh_sharma
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

<<<<<<< HEAD
=======
// Get active sessions
router.get('/active-sessions', adminAuth, async (req, res) => {
    try {
        const now = new Date();
        const sessions = await AttendanceSession.find({
            startTime: { $lte: now },
            endTime: { $gte: now },
            isClosed: false
        }).sort({ startTime: -1 });

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Close session manually
router.post('/close-session/:sessionId', adminAuth, async (req, res) => {
    try {
        const session = await AttendanceSession.findById(req.params.sessionId);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.isClosed) {
            return res.status(400).json({ error: 'Session already closed' });
        }

        session.isClosed = true;
        session.status = 'closed';
        await session.save();

        // Send absent emails to students who didn't attend
        console.log('Session closed - sending absent emails...');
        sendAbsentEmailsForSession(session).catch(err =>
            console.error('Error sending absent emails:', err)
        );

        res.json({
            message: 'Session closed successfully. Absent emails are being sent.',
            session
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to send absent emails
async function sendAbsentEmailsForSession(session) {
    try {
        // Get all enrolled students for this subject
        const subject = await Subject.findById(session.subjectId);
        if (!subject || !subject.enrolledStudents || subject.enrolledStudents.length === 0) {
            console.log('No enrolled students found for this subject');
            return;
        }

        // Get list of students who attended
        const attendedStudentIds = session.recognizedStudents.map(
            rs => rs.studentId.toString()
        );

        // Find students who were absent
        const absentStudents = subject.enrolledStudents.filter(
            enrolled => !attendedStudentIds.includes(enrolled.studentId.toString())
        );

        console.log(`Sending absent emails to ${absentStudents.length} students`);

        // Send absent emails
        const emailPromises = absentStudents.map(async (enrolledStudent) => {
            try {
                const student = await Student.findById(enrolledStudent.studentId);
                if (!student) return;

                // Calculate attendance percentage for this subject
                const subjectAttendance = student.attendanceRecords.filter(
                    record => record.subjectId && record.subjectId.toString() === session.subjectId.toString()
                );

                const totalSubjectSessions = await AttendanceSession.countDocuments({
                    subjectId: session.subjectId,
                    isClosed: true
                });

                const attendancePercentage = totalSubjectSessions > 0
                    ? (subjectAttendance.length / totalSubjectSessions) * 100
                    : 0;

                await sendAbsentEmail(
                    student.email,
                    student.name,
                    session.sessionName,
                    session.subjectName,
                    attendancePercentage
                );
            } catch (err) {
                console.error(`Error sending absent email to ${enrolledStudent.email}:`, err);
            }
        });

        await Promise.all(emailPromises);
        console.log('Absent emails sent successfully');
    } catch (error) {
        console.error('Error in sendAbsentEmailsForSession:', error);
    }
}

// Check ESP32-CAM availability
router.get('/check-esp32', adminAuth, async (req, res) => {
    try {
        const response = await axios.get(ESP32_CAM_URL, {
            params: { _cb: Date.now() },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Origin': 'http://10.255.12.208',
                'Referer': 'http://10.255.12.208/'
            },
            responseType: 'arraybuffer',
            timeout: 5000
        });

        res.json({ available: true, message: 'ESP32-CAM is reachable' });
    } catch (error) {
        res.json({ available: false, message: 'ESP32-CAM is not reachable' });
    }
});

>>>>>>> harsh_sharma
// Capture photos from ESP32-CAM
router.post('/capture-photos/:sessionId', adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

<<<<<<< HEAD
=======
        // Check if session is active
        const now = new Date();
        if (now < session.startTime) {
            return res.status(400).json({ error: 'Session has not started yet' });
        }

        if (now > session.endTime || session.isClosed) {
            return res.status(400).json({ error: 'Session has ended' });
        }

>>>>>>> harsh_sharma
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
<<<<<<< HEAD
                            public_id: `photo_${i}_${Date.now()}`,
=======
                            public_id: `photo_${session.captureCount}_${i}_${Date.now()}`,
>>>>>>> harsh_sharma
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

<<<<<<< HEAD
        // Update session with photos
        session.photos = capturedPhotos;
        session.totalPhotos = capturedPhotos.length;
=======
        // Append photos to session
        session.photos.push(...capturedPhotos);
        session.totalPhotos = session.photos.length;
        session.captureCount += 1;
>>>>>>> harsh_sharma
        session.status = 'processing';
        await session.save();

        res.json({
            message: `Captured ${capturedPhotos.length} photos`,
            sessionId: session._id,
<<<<<<< HEAD
            totalPhotos: capturedPhotos.length,
=======
            totalPhotos: session.photos.length,
            captureCount: session.captureCount,
>>>>>>> harsh_sharma
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

<<<<<<< HEAD
=======
// Upload photos manually (fallback when ESP32 not available)
router.post('/upload-photos/:sessionId', adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { photos } = req.body; // Array of base64 images

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Check if session is active
        const now = new Date();
        if (now < session.startTime) {
            return res.status(400).json({ error: 'Session has not started yet' });
        }

        if (now > session.endTime || session.isClosed) {
            return res.status(400).json({ error: 'Session has ended' });
        }

        if (!photos || photos.length === 0) {
            return res.status(400).json({ error: 'No photos provided' });
        }

        const uploadedPhotos = [];

        for (let i = 0; i < photos.length; i++) {
            try {
                console.log(`Uploading photo ${i + 1}/${photos.length}...`);
                const uploadResult = await cloudinary.uploader.upload(photos[i], {
                    folder: `attendance-sessions/${sessionId}`,
                    public_id: `manual_${session.captureCount}_${i}_${Date.now()}`,
                    resource_type: 'image'
                });

                uploadedPhotos.push({
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id
                });
                console.log(`Photo ${i + 1} uploaded successfully`);
            } catch (error) {
                console.error(`Error uploading photo ${i + 1}:`, error.message);
            }
        }

        if (uploadedPhotos.length === 0) {
            console.error('All photo uploads failed');
            return res.status(500).json({ error: 'Failed to upload any photos. Check server logs for details.' });
        }

        console.log(`Successfully uploaded ${uploadedPhotos.length}/${photos.length} photos`);

        // Append photos to session
        session.photos.push(...uploadedPhotos);
        session.totalPhotos = session.photos.length;
        session.captureCount += 1;
        session.status = 'processing';
        await session.save();

        res.json({
            message: `Uploaded ${uploadedPhotos.length} photos`,
            sessionId: session._id,
            totalPhotos: session.photos.length,
            captureCount: session.captureCount
        });
    } catch (error) {
        console.error('Upload photos error:', error);
        res.status(500).json({ error: error.message });
    }
});

>>>>>>> harsh_sharma
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
<<<<<<< HEAD
                        if (face.verified && face.registrationNumber) {
=======
                        // Only accept faces with confidence >= 60%
                        if (face.verified && face.registrationNumber && face.confidence >= 0.60) {
>>>>>>> harsh_sharma
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

<<<<<<< HEAD
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
=======
        // Get enrolled students for this subject
        const subject = await Subject.findById(session.subjectId);
        const enrolledStudentIds = subject?.enrolledStudents?.map(e => e.studentId.toString()) || [];

        // Get already marked students in this session
        const alreadyMarkedIds = session.recognizedStudents?.map(rs => rs.studentId.toString()) || [];

        // Convert map to array and process only enrolled students
        const recognizedStudents = [];
        const emailPromises = [];
        const skippedStudents = [];

        for (const [regNum, data] of recognizedStudentsMap) {
            const student = await Student.findOne({ registrationNumber: regNum });

            if (!student) {
                console.log(`Student not found: ${regNum}`);
                continue;
            }

            // Check if student is enrolled in this subject
            const isEnrolled = enrolledStudentIds.includes(student._id.toString());
            if (!isEnrolled) {
                console.log(`Student ${student.name} (${regNum}) not enrolled in ${session.subjectName} - skipping`);
                skippedStudents.push({
                    name: student.name,
                    registrationNumber: regNum,
                    reason: 'Not enrolled in subject'
                });
                continue;
            }

            // Check if already marked present in this session
            const alreadyMarked = alreadyMarkedIds.includes(student._id.toString());
            if (alreadyMarked) {
                console.log(`Student ${student.name} (${regNum}) already marked present in this session - skipping`);
                skippedStudents.push({
                    name: student.name,
                    registrationNumber: regNum,
                    reason: 'Already marked present in this session'
                });
                continue;
            }

            // Mark attendance for enrolled student
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
                subjectId: session.subjectId,
                subjectName: session.subjectName,
                photoUrl: data.bestPhotoUrl,
                confidence: data.confidence,
                markedAt: new Date()
            });
            await student.save();

            // Calculate attendance percentage for this subject
            const subjectAttendance = student.attendanceRecords.filter(
                record => record.subjectId && record.subjectId.toString() === session.subjectId.toString()
            );

            // Get total sessions for this subject
            const totalSubjectSessions = await AttendanceSession.countDocuments({
                subjectId: session.subjectId,
                isClosed: true
            });

            const attendancePercentage = totalSubjectSessions > 0
                ? (subjectAttendance.length / totalSubjectSessions) * 100
                : 100;

            // Send email notification (non-blocking)
            emailPromises.push(
                sendAttendanceEmail(
                    student.email,
                    student.name,
                    session.sessionName,
                    data.confidence,
                    attendancePercentage,
                    session.subjectName
                ).catch(err => console.error('Email error:', err))
            );
        }

        // Send all emails in parallel (don't wait for completion)
        Promise.all(emailPromises).catch(err => console.error('Error sending emails:', err));

        console.log(`Processed: ${recognizedStudents.length} students marked, ${skippedStudents.length} skipped`);

        // Append new recognized students (don't replace existing ones)
        if (!session.recognizedStudents) {
            session.recognizedStudents = [];
        }
        session.recognizedStudents.push(...recognizedStudents);
        session.studentsRecognized = session.recognizedStudents.length;

        // Check if session should be closed
        const now = new Date();
        if (now > session.endTime) {
            session.status = 'closed';
            session.isClosed = true;
        } else {
            session.status = 'active';
        }

>>>>>>> harsh_sharma
        await session.save();

        res.json({
            message: 'Attendance processed successfully',
            sessionId: session._id,
            totalPhotos: session.totalPhotos,
<<<<<<< HEAD
            studentsRecognized: recognizedStudents.length,
            students: recognizedStudents
=======
            studentsRecognized: session.recognizedStudents.length,
            newlyMarked: recognizedStudents.length,
            skipped: skippedStudents.length,
            students: recognizedStudents,
            skippedStudents: skippedStudents,
            status: session.status
>>>>>>> harsh_sharma
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

<<<<<<< HEAD
=======
        // Check if session should be auto-closed (but don't send emails yet)
        const now = new Date();
        if (now > session.endTime && !session.isClosed) {
            session.status = 'expired'; // Mark as expired but not closed
        }

>>>>>>> harsh_sharma
        res.json({ session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

<<<<<<< HEAD
=======
// Get attendance sheet for a subject
router.get('/attendance-sheet/:subjectId', adminAuth, async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Get subject with enrolled students
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Get all closed sessions for this subject
        const sessions = await AttendanceSession.find({
            subjectId,
            isClosed: true
        }).sort({ startTime: 1 });

        // Get all enrolled students
        const enrolledStudents = subject.enrolledStudents || [];

        // Build attendance matrix
        const attendanceSheet = enrolledStudents.map(enrolled => {
            const student = {
                studentId: enrolled.studentId,
                registrationNumber: enrolled.registrationNumber,
                name: enrolled.name,
                email: enrolled.email,
                attendance: []
            };

            // For each session, check if student attended
            sessions.forEach(session => {
                const attended = session.recognizedStudents?.some(
                    rs => rs.studentId.toString() === enrolled.studentId.toString()
                );

                const attendanceRecord = session.recognizedStudents?.find(
                    rs => rs.studentId.toString() === enrolled.studentId.toString()
                );

                student.attendance.push({
                    sessionId: session._id,
                    sessionName: session.sessionName,
                    date: session.startTime,
                    status: attended ? 'present' : 'absent',
                    confidence: attendanceRecord?.confidence || null,
                    markedAt: attendanceRecord?.recognizedAt || null
                });
            });

            // Calculate attendance percentage
            const totalSessions = sessions.length;
            const attendedSessions = student.attendance.filter(a => a.status === 'present').length;
            student.attendancePercentage = totalSessions > 0
                ? (attendedSessions / totalSessions) * 100
                : 0;
            student.attendedCount = attendedSessions;
            student.totalSessions = totalSessions;

            return student;
        });

        res.json({
            subject: {
                id: subject._id,
                name: subject.name,
                code: subject.code
            },
            sessions: sessions.map(s => ({
                id: s._id,
                name: s.sessionName,
                date: s.startTime,
                studentsPresent: s.studentsRecognized || 0
            })),
            students: attendanceSheet,
            totalStudents: enrolledStudents.length,
            totalSessions: sessions.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manually mark/unmark attendance
router.post('/manual-attendance/:sessionId', adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { studentId, action, reason } = req.body; // action: 'mark' or 'unmark'

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if student is enrolled
        const subject = await Subject.findById(session.subjectId);
        const isEnrolled = subject?.enrolledStudents?.some(
            e => e.studentId.toString() === studentId
        );

        if (!isEnrolled) {
            return res.status(400).json({ error: 'Student not enrolled in this subject' });
        }

        if (action === 'mark') {
            // Check if already marked
            const alreadyMarked = session.recognizedStudents?.some(
                rs => rs.studentId.toString() === studentId
            );

            if (alreadyMarked) {
                return res.status(400).json({ error: 'Student already marked present' });
            }

            // Add to session
            if (!session.recognizedStudents) {
                session.recognizedStudents = [];
            }
            session.recognizedStudents.push({
                studentId: student._id,
                registrationNumber: student.registrationNumber,
                name: student.name,
                confidence: 1.0, // Manual marking = 100% confidence
                bestPhotoUrl: null,
                photoIndex: -1,
                manuallyMarked: true,
                markedBy: req.adminId,
                reason: reason || 'Manually marked by admin'
            });
            session.studentsRecognized = session.recognizedStudents.length;

            // Add to student's attendance records
            if (!student.attendanceRecords) {
                student.attendanceRecords = [];
            }
            student.attendanceRecords.push({
                sessionId: session._id,
                sessionName: session.sessionName,
                subjectId: session.subjectId,
                subjectName: session.subjectName,
                photoUrl: null,
                confidence: 1.0,
                markedAt: new Date(),
                manuallyMarked: true
            });

            await session.save();
            await student.save();

            res.json({
                message: 'Attendance marked successfully',
                action: 'marked'
            });

        } else if (action === 'unmark') {
            // Remove from session
            session.recognizedStudents = session.recognizedStudents?.filter(
                rs => rs.studentId.toString() !== studentId
            ) || [];
            session.studentsRecognized = session.recognizedStudents.length;

            // Remove from student's attendance records
            student.attendanceRecords = student.attendanceRecords?.filter(
                record => record.sessionId.toString() !== sessionId
            ) || [];

            await session.save();
            await student.save();

            res.json({
                message: 'Attendance unmarked successfully',
                action: 'unmarked'
            });

        } else {
            return res.status(400).json({ error: 'Invalid action. Use "mark" or "unmark"' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

>>>>>>> harsh_sharma
module.exports = router;
