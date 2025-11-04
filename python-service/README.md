# Face Recognition Service

Python Flask service for facial recognition using face_recognition library (based on dlib).

## Setup

### Install Dependencies

```bash
cd python-service
pip install -r requirements.txt
```

### Run Service

```bash
python app.py
```

Service runs on: http://localhost:5001

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Generate Embeddings
```
POST /generate-embeddings
Body: {
  "registrationNumber": "12345678"
}
```
Generates face embeddings from student's uploaded photos and stores them in MongoDB.

### 3. Verify Face
```
POST /verify-face
Body: {
  "imageUrl": "https://...",
  "registrationNumber": "12345678" (optional)
}
```
Verifies a face against stored embeddings. If registrationNumber is provided, verifies against that student only. Otherwise, searches all students.

### 4. Get Student Embeddings Info
```
GET /get-student-embeddings/<registration_number>
```
Returns embedding status for a student.

## Features

- Uses face_recognition library (dlib-based, highly accurate)
- Generates 128-dimensional face embeddings
- Stores embeddings in MongoDB
- Face verification with confidence scores
- Handles multiple photos per student
- Validates single face per image
- Search across all students or verify specific student
