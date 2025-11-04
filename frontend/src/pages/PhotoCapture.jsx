import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

function PhotoCapture({ token }) {
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const navigate = useNavigate();

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setCameraActive(true);
            setError('');
        } catch (err) {
            setError('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
        }
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPhotos(prev => [...prev, { file, preview: URL.createObjectURL(blob) }]);
        }, 'image/jpeg', 0.9);
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async () => {
        if (photos.length < 3) {
            setError('Please capture at least 3 photos');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            photos.forEach(photo => {
                formData.append('photos', photo.file);
            });

            await api.post('/api/photos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            stopCamera();
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Capture Your Photos</h1>
                <p className="subtitle">We need at least 3 photos for facial recognition</p>

                {error && <div className="error">{error}</div>}

                <div style={{ marginTop: '20px' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            borderRadius: '10px',
                            display: cameraActive ? 'block' : 'none',
                            margin: '0 auto'
                        }}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {!cameraActive ? (
                            <button onClick={startCamera}>Start Camera</button>
                        ) : (
                            <>
                                <button onClick={capturePhoto}>Capture Photo ({photos.length})</button>
                                <button onClick={stopCamera} style={{ background: '#dc3545' }}>Stop Camera</button>
                            </>
                        )}
                    </div>

                    {photos.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Captured Photos ({photos.length})</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                gap: '15px'
                            }}>
                                {photos.map((photo, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img
                                            src={photo.preview}
                                            alt={`Capture ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                borderRadius: '10px',
                                                aspectRatio: '1',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            onClick={() => removePhoto(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '5px',
                                                right: '5px',
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                background: '#dc3545',
                                                padding: '0',
                                                fontSize: '18px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={uploadPhotos}
                                disabled={uploading || photos.length < 3}
                                style={{ marginTop: '20px' }}
                            >
                                {uploading ? 'Uploading...' : `Upload ${photos.length} Photos`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PhotoCapture;
