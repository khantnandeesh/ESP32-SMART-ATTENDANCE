from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import requests
from PIL import Image
from io import BytesIO
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['attendance-system']
students_collection = db['students']

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        return super(NumpyEncoder, self).default(obj)

def download_image(url):
    """Download image from URL"""
    response = requests.get(url)
    return Image.open(BytesIO(response.content))

def get_face_encoding(image_url):
    """Extract face encoding from image URL"""
    try:
        image = download_image(image_url)
        image_np = np.array(image)
        
        face_locations = face_recognition.face_locations(image_np)
        
        if len(face_locations) == 0:
            return None, "No face detected in image"
        
        if len(face_locations) > 1:
            return None, "Multiple faces detected. Please use images with single face"
        
        face_encodings = face_recognition.face_encodings(image_np, face_locations)
        
        if len(face_encodings) > 0:
            return face_encodings[0], None
        
        return None, "Could not generate face encoding"
    except Exception as e:
        return None, str(e)

def get_all_face_encodings(image_url):
    """Extract all face encodings from image URL (for group photos)"""
    try:
        image = download_image(image_url)
        image_np = np.array(image)
        
        face_locations = face_recognition.face_locations(image_np)
        
        if len(face_locations) == 0:
            return [], "No faces detected in image"
        
        face_encodings = face_recognition.face_encodings(image_np, face_locations)
        
        return face_encodings, None
    except Exception as e:
        return [], str(e)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "face-recognition"}), 200

@app.route('/generate-embeddings', methods=['POST'])
def generate_embeddings():
    """Generate face embeddings for a student"""
    try:
        data = request.json
        registration_number = data.get('registrationNumber')
        
        if not registration_number:
            return jsonify({"error": "Registration number is required"}), 400
        
        student = students_collection.find_one({"registrationNumber": registration_number})
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        if not student.get('photos') or len(student['photos']) < 3:
            return jsonify({"error": "Student must have at least 3 photos"}), 400
        
        embeddings = []
        failed_photos = []
        
        for idx, photo in enumerate(student['photos']):
            encoding, error = get_face_encoding(photo['url'])
            
            if encoding is not None:
                embeddings.append({
                    "photoId": photo.get('publicId'),
                    "embedding": encoding.tolist(),
                    "photoUrl": photo['url']
                })
            else:
                failed_photos.append({
                    "photoId": photo.get('publicId'),
                    "error": error
                })
        
        if len(embeddings) < 3:
            return jsonify({
                "error": f"Could not generate enough embeddings. Only {len(embeddings)} valid faces found",
                "failed_photos": failed_photos
            }), 400
        
        students_collection.update_one(
            {"_id": student['_id']},
            {
                "$set": {
                    "faceEmbeddings": embeddings,
                    "embeddingsGenerated": True,
                    "embeddingsCount": len(embeddings)
                }
            }
        )
        
        return jsonify({
            "message": "Face embeddings generated successfully",
            "registrationNumber": registration_number,
            "embeddingsCount": len(embeddings),
            "failedPhotos": len(failed_photos)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recognize-multiple-faces', methods=['POST'])
def recognize_multiple_faces():
<<<<<<< HEAD
    """Recognize multiple faces in a group photo"""
=======
    """
    Recognize multiple faces in a group photo
    
    Anti-Spoofing Measures:
    - Uses stricter tolerance (0.5) to reduce false positives
    - Requires minimum confidence of 60% (enforced in backend)
    - Multiple reference photos per student for better accuracy
    
    Note: For production, consider adding:
    - Liveness detection (blink detection, head movement)
    - 3D depth sensing
    - Texture analysis to detect printed photos
    """
>>>>>>> harsh_sharma
    try:
        data = request.json
        image_url = data.get('imageUrl')
        
        if not image_url:
            return jsonify({"error": "Image URL is required"}), 400
        
        # Get all face encodings from the image
        test_encodings, error = get_all_face_encodings(image_url)
        
        if len(test_encodings) == 0:
            return jsonify({"error": error or "No faces detected"}), 400
        
        # Get all students with embeddings
        all_students = list(students_collection.find({"embeddingsGenerated": True}))
        
        recognized_faces = []
        
        # For each detected face
        for face_idx, test_encoding in enumerate(test_encodings):
            best_match = None
            best_confidence = 0
            
            # Compare with all students
            for student in all_students:
                if not student.get('faceEmbeddings'):
                    continue
                
                stored_encodings = [np.array(emb['embedding']) for emb in student['faceEmbeddings']]
<<<<<<< HEAD
                matches = face_recognition.compare_faces(stored_encodings, test_encoding, tolerance=0.6)
=======
                
                # Stricter tolerance for better anti-spoofing
                matches = face_recognition.compare_faces(stored_encodings, test_encoding, tolerance=0.5)
>>>>>>> harsh_sharma
                
                if any(matches):
                    face_distances = face_recognition.face_distance(stored_encodings, test_encoding)
                    best_match_index = np.argmin(face_distances)
                    confidence = 1 - face_distances[best_match_index]
                    
<<<<<<< HEAD
                    if confidence > best_confidence:
=======
                    # Only consider if confidence is high enough
                    if confidence > best_confidence and confidence >= 0.55:
>>>>>>> harsh_sharma
                        best_confidence = confidence
                        best_match = {
                            "registrationNumber": student['registrationNumber'],
                            "name": student['name'],
                            "confidence": float(confidence),
                            "verified": True
                        }
            
            if best_match:
                recognized_faces.append(best_match)
            else:
                recognized_faces.append({
                    "verified": False,
<<<<<<< HEAD
                    "message": f"Face {face_idx + 1} not recognized"
=======
                    "message": f"Face {face_idx + 1} not recognized or confidence too low"
>>>>>>> harsh_sharma
                })
        
        return jsonify({
            "totalFaces": len(test_encodings),
            "recognizedCount": len([f for f in recognized_faces if f.get('verified')]),
            "faces": recognized_faces
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/verify-face', methods=['POST'])
def verify_face():
    """Verify a face against stored embeddings"""
    try:
        data = request.json
        image_url = data.get('imageUrl')
        registration_number = data.get('registrationNumber')
        
        if not image_url:
            return jsonify({"error": "Image URL is required"}), 400
        
        test_encoding, error = get_face_encoding(image_url)
        
        if test_encoding is None:
            return jsonify({"error": error}), 400
        
        if registration_number:
            student = students_collection.find_one({"registrationNumber": registration_number})
            
            if not student:
                return jsonify({"error": "Student not found"}), 404
            
            if not student.get('faceEmbeddings'):
                return jsonify({"error": "No face embeddings found for this student"}), 400
            
            stored_encodings = [np.array(emb['embedding']) for emb in student['faceEmbeddings']]
            
            matches = face_recognition.compare_faces(stored_encodings, test_encoding, tolerance=0.6)
            face_distances = face_recognition.face_distance(stored_encodings, test_encoding)
            
            if any(matches):
                best_match_index = np.argmin(face_distances)
                confidence = 1 - face_distances[best_match_index]
                
                return jsonify({
                    "verified": True,
                    "registrationNumber": registration_number,
                    "name": student['name'],
                    "confidence": float(confidence),
                    "matchedPhoto": student['faceEmbeddings'][best_match_index]['photoUrl']
                }), 200
            else:
                return jsonify({
                    "verified": False,
                    "message": "Face does not match"
                }), 200
        
        else:
            all_students = students_collection.find({"embeddingsGenerated": True})
            
            best_match = None
            best_confidence = 0
            
            for student in all_students:
                stored_encodings = [np.array(emb['embedding']) for emb in student['faceEmbeddings']]
                matches = face_recognition.compare_faces(stored_encodings, test_encoding, tolerance=0.6)
                
                if any(matches):
                    face_distances = face_recognition.face_distance(stored_encodings, test_encoding)
                    best_match_index = np.argmin(face_distances)
                    confidence = 1 - face_distances[best_match_index]
                    
                    if confidence > best_confidence:
                        best_confidence = confidence
                        best_match = {
                            "registrationNumber": student['registrationNumber'],
                            "name": student['name'],
                            "confidence": float(confidence),
                            "matchedPhoto": student['faceEmbeddings'][best_match_index]['photoUrl']
                        }
            
            if best_match:
                return jsonify({
                    "verified": True,
                    **best_match
                }), 200
            else:
                return jsonify({
                    "verified": False,
                    "message": "No matching face found"
                }), 200
                
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-student-embeddings/<registration_number>', methods=['GET'])
def get_student_embeddings(registration_number):
    """Get embeddings info for a student"""
    try:
        student = students_collection.find_one({"registrationNumber": registration_number})
        
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        return jsonify({
            "registrationNumber": registration_number,
            "name": student['name'],
            "embeddingsGenerated": student.get('embeddingsGenerated', False),
            "embeddingsCount": student.get('embeddingsCount', 0),
            "hasPhotos": student.get('hasPhotos', False),
            "photoCount": len(student.get('photos', []))
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    print(f"Face Recognition Service running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
