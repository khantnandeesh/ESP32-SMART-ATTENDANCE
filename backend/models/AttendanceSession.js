const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
    sessionName: {
        type: String,
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
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
        enum: ['capturing', 'processing', 'completed', 'failed'],
        default: 'capturing'
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
