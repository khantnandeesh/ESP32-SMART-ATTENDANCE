# Smart Attendance System

A facial recognition-based attendance system with student authentication and photo capture.

```https://p.ip.fi/wZoo``` ->refer for sample .env
## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Python Face Recognition Service
```bash
cd python-service
pip install -r requirements.txt
python app.py
```

## Features

- **Sign In**: New students register with name, college email, and 8-digit registration number
- **Login**: Existing students login with registration number
- **Photo Capture**: First-time users must capture minimum 3 photos using webcam
- **Dashboard**: View student profile and status
- **Cloud Storage**: Photos stored in Cloudinary for facial recognition

## Environment Variables

Backend `.env` file is already configured with:
- MongoDB connection
- Cloudinary credentials
- JWT secret

## Access

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Python Service: http://localhost:5001
