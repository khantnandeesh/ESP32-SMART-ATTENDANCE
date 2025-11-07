# Anti-Spoofing & Security Measures

## Current Implementation

### 1. **Confidence Threshold (60%)**
- Only marks attendance if face recognition confidence is ≥ 60%
- Reduces false positives from photos, screens, or poor quality images
- Backend enforces this threshold before marking attendance

### 2. **Stricter Face Matching**
- Tolerance reduced from 0.6 to 0.5 in Python service
- Requires higher similarity between captured face and stored embeddings
- Multiple reference photos (minimum 3) per student for better accuracy

### 3. **Email Notifications**
Students receive instant email when attendance is marked with:
- Session details
- Recognition confidence score
- Current attendance percentage for that subject
- Color-coded warnings (Green ≥75%, Yellow ≥60%, Red <60%)

### 4. **Attendance Percentage Tracking**
- Calculates real-time attendance percentage per subject
- Helps students monitor their attendance status
- Included in email notifications

## How It Prevents Spoofing

### Photo/Screen Spoofing
- **Multiple Reference Photos**: System compares against 3+ photos of each student
- **High Confidence Requirement**: Photos/screens typically score 40-55% confidence
- **Strict Tolerance**: 0.5 tolerance makes it harder to match with 2D images

### Proxy Attendance
- **Email Verification**: Student receives immediate email confirmation
- **Confidence Score**: Low confidence scores flag suspicious matches
- **Audit Trail**: All attendance records include confidence scores and timestamps

## Recommended Additional Measures (Future)

### 1. **Liveness Detection**
```python
# Detect blink or head movement
- Require 2-3 consecutive frames
- Detect eye blinks
- Require slight head movement
```

### 2. **3D Depth Sensing**
- Use depth cameras (Intel RealSense, iPhone TrueDepth)
- Detect 3D face structure vs flat photos

### 3. **Texture Analysis**
- Analyze image texture to detect printed photos
- Check for screen glare patterns

### 4. **Random Challenges**
- Ask student to smile, turn head, or blink
- Verify response in real-time

### 5. **Location Verification**
- Check if student is within classroom geofence
- Verify WiFi network (college network only)

### 6. **Time-based Restrictions**
- Only allow attendance during class hours
- Prevent early/late submissions

## Configuration

### Email Setup
Add to `backend/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the generated password in EMAIL_PASSWORD

### Confidence Threshold
Adjust in `backend/routes/attendance.js`:
```javascript
if (face.verified && face.registrationNumber && face.confidence >= 0.60) {
    // Change 0.60 to desired threshold (0.50-0.80 recommended)
}
```

### Face Matching Tolerance
Adjust in `python-service/app.py`:
```python
matches = face_recognition.compare_faces(stored_encodings, test_encoding, tolerance=0.5)
# Lower = stricter (0.4-0.6 recommended)
```

## Testing Anti-Spoofing

### Test with Photo
1. Take a photo of a student
2. Show the photo to camera during attendance
3. Expected: Low confidence (40-55%) → Attendance NOT marked

### Test with Real Student
1. Student stands in front of camera
2. System captures face
3. Expected: High confidence (65-95%) → Attendance marked + Email sent

### Test Email Notifications
1. Mark attendance for a student
2. Check student's email inbox
3. Verify email contains correct details and percentage

## Monitoring

### Check Confidence Scores
```javascript
// In admin panel, view session details
// Low confidence scores (<65%) may indicate spoofing attempts
```

### Review Attendance Patterns
- Multiple students with same confidence score → Suspicious
- Attendance from unusual locations → Investigate
- Sudden attendance spikes → Verify manually

## Best Practices

1. **Require 3+ Photos**: More reference photos = better accuracy
2. **Good Lighting**: Ensure classroom has adequate lighting
3. **Camera Position**: Mount camera at face level, 2-3 feet away
4. **Regular Updates**: Re-capture student photos every semester
5. **Manual Verification**: Randomly verify attendance records
6. **Student Education**: Inform students about anti-spoofing measures

## Support

For issues or questions:
- Check confidence scores in session details
- Review email logs for delivery issues
- Adjust thresholds based on your environment
- Consider additional hardware (depth cameras) for maximum security
