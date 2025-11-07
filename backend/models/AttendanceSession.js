const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
    sessionName: {
        type: String,
        required: true
    },
<<<<<<< HEAD
=======
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    subjectName: String,
    subjectCode: String,
>>>>>>> harsh_sharma
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
<<<<<<< HEAD
=======
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    captureCount: {
        type: Number,
        default: 0
    },
>>>>>>> harsh_sharma
    photos: [{
        url: String,
        publicId: String,
        capturedAt: {
            type: Date,
            default: Date.now
        }
    }],
    recognizedStudents: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        registrationNumber: String,
        name: String,
        confidence: Number,
        bestPhotoUrl: String,
        photoIndex: Number,
        recognizedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
<<<<<<< HEAD
        enum: ['capturing', 'processing', 'completed', 'failed'],
        default: 'capturing'
=======
        enum: ['active', 'capturing', 'processing', 'completed', 'closed'],
        default: 'active'
>>>>>>> harsh_sharma
    },
    totalPhotos: {
        type: Number,
        default: 0
    },
    studentsRecognized: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
