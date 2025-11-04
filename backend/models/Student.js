const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid college email']
    },
    registrationNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{8}$/, 'Registration number must be 8 digits']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    photos: [{
        url: String,
        publicId: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    hasPhotos: {
        type: Boolean,
        default: false
    },
    faceEmbeddings: [{
        photoId: String,
        embedding: [Number],
        photoUrl: String
    }],
    embeddingsGenerated: {
        type: Boolean,
        default: false
    },
    embeddingsCount: {
        type: Number,
        default: 0
    },
    attendanceRecords: [{
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AttendanceSession'
        },
        sessionName: String,
        photoUrl: String,
        confidence: Number,
        markedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
