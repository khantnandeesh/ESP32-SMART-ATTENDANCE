require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photos');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');
const attendanceRoutes = require('./routes/attendance');
<<<<<<< HEAD
=======
const subjectRoutes = require('./routes/subjects');
>>>>>>> harsh_sharma

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
<<<<<<< HEAD
app.use(express.json());
=======
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
>>>>>>> harsh_sharma

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/attendance', attendanceRoutes);
<<<<<<< HEAD
=======
app.use('/api/subjects', subjectRoutes);
>>>>>>> harsh_sharma

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
