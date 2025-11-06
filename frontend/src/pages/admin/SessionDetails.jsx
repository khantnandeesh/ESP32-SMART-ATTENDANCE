import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import AdminLayout from '../../components/AdminLayout';

function SessionDetails({ setAdminToken }) {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();
    const [esp32Available, setEsp32Available] = useState(null);
    const [showManualCapture, setShowManualCapture] = useState(false);
    const [capturedPhotos, setCapturedPhotos] = useState([]);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Automated Capture Mode
    const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(false);
    const [captureInterval, setCaptureInterval] = useState(120); // seconds
    const [autoProcessEnabled, setAutoProcessEnabled] = useState(true);
    const [captureStats, setCaptureStats] = useState({ total: 0, successful: 0, failed: 0 });
    const autoCaptureTimerRef = useRef(null);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    useEffect(() => {
        fetchSessionDetails();
        const interval = setInterval(fetchSessionDetails, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [sessionId]);

    const fetchSessionDetails = async () => {
        try {
            const response = await api.get(`/api/attendance/session/${sessionId}`);
            setSession(response.data.session);
        } catch (error) {
            console.error('Error fetching session:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkESP32 = async () => {
        try {
            const response = await api.get('/api/attendance/check-esp32');
            setEsp32Available(response.data.available);
            return response.data.available;
        } catch (error) {
            setEsp32Available(false);
            return false;
        }
    };

    const handleCapture = async () => {
        if (!session) return;

        const now = new Date();
        if (now > new Date(session.endTime) || session.isClosed) {
            alert('Session has ended');
            return;
        }

        setCapturing(true);

        // Check ESP32 availability first
        const isAvailable = await checkESP32();

        if (!isAvailable) {
            setCapturing(false);
            alert('ESP32-CAM not reachable. Please use Manual Camera Capture.');
            setShowManualCapture(true);
            startCamera();
            return;
        }

        try {
            const captureResponse = await api.post(`/api/attendance/capture-photos/${sessionId}`);
            alert(`Captured ${captureResponse.data.totalPhotos - session.totalPhotos} new photos!`);

            setProcessing(true);
            const processResponse = await api.post(`/api/attendance/process-session/${sessionId}`);

            let message = `✅ Attendance Processed!\n\n`;
            message += `Total Students Marked: ${processResponse.data.studentsRecognized}\n`;
            message += `Newly Marked: ${processResponse.data.newlyMarked}\n`;

            if (processResponse.data.skipped > 0) {
                message += `\n⚠️ Skipped: ${processResponse.data.skipped} students\n`;
                message += `Reasons: Not enrolled or already marked\n`;
            }

            alert(message);
            fetchSessionDetails();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to capture from ESP32');
            // If ESP32 capture fails, offer manual capture
            setShowManualCapture(true);
            startCamera();
        } finally {
            setCapturing(false);
            setProcessing(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 1280, height: 720 }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            alert('Failed to access camera: ' + error.message);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Resize to max 1280px width to reduce file size
        const maxWidth = 1280;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Use 0.7 quality for smaller file size
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCapturedPhotos([...capturedPhotos, photoDataUrl]);
    };

    const removePhoto = (index) => {
        setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
    };

    const uploadCapturedPhotos = async () => {
        if (capturedPhotos.length === 0) {
            alert('Please capture at least one photo');
            return;
        }

        setCapturing(true);

        try {
            console.log('Uploading', capturedPhotos.length, 'photos...');

            // Log photo sizes for debugging
            capturedPhotos.forEach((photo, idx) => {
                const sizeInKB = (photo.length * 0.75 / 1024).toFixed(2);
                console.log(`Photo ${idx + 1} size: ${sizeInKB} KB`);
            });

            const uploadResponse = await api.post(`/api/attendance/upload-photos/${sessionId}`, {
                photos: capturedPhotos
            });

            console.log('Upload response:', uploadResponse.data);
            alert(`Uploaded ${capturedPhotos.length} photos successfully!`);

            setProcessing(true);
            const processResponse = await api.post(`/api/attendance/process-session/${sessionId}`);
            console.log('Process response:', processResponse.data);

            let message = `✅ Attendance Processed!\n\n`;
            message += `Total Students Marked: ${processResponse.data.studentsRecognized}\n`;
            message += `Newly Marked: ${processResponse.data.newlyMarked}\n`;

            if (processResponse.data.skipped > 0) {
                message += `\n⚠️ Skipped: ${processResponse.data.skipped} students\n`;
                message += `Reasons: Not enrolled or already marked\n`;
                if (processResponse.data.skippedStudents) {
                    message += `\nSkipped Students:\n`;
                    processResponse.data.skippedStudents.forEach(s => {
                        message += `• ${s.name} (${s.registrationNumber}): ${s.reason}\n`;
                    });
                }
            }

            alert(message);

            stopCamera();
            setShowManualCapture(false);
            setCapturedPhotos([]);
            fetchSessionDetails();
        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.error || error.message || 'Failed to upload';
            alert(`Upload failed: ${errorMsg}\n\nCheck browser console for details.`);
        } finally {
            setCapturing(false);
            setProcessing(false);
        }
    };

    // Start automated capture mode
    const startAutomatedCapture = async () => {
        const isAvailable = await checkESP32();
        if (!isAvailable) {
            alert('ESP32-CAM not available. Automated capture requires ESP32-CAM connection.');
            return;
        }

        setAutoCaptureEnabled(true);
        setCaptureStats({ total: 0, successful: 0, failed: 0 });

        // Immediate first capture
        performAutomatedCapture();

        // Set up interval for subsequent captures
        autoCaptureTimerRef.current = setInterval(() => {
            performAutomatedCapture();
        }, captureInterval * 1000);
    };

    // Stop automated capture mode
    const stopAutomatedCapture = () => {
        setAutoCaptureEnabled(false);
        if (autoCaptureTimerRef.current) {
            clearInterval(autoCaptureTimerRef.current);
            autoCaptureTimerRef.current = null;
        }
    };

    // Perform a single automated capture
    const performAutomatedCapture = async () => {
        try {
            console.log(`[Auto-Capture] Capturing at ${new Date().toLocaleTimeString()}`);

            const captureResponse = await api.post(`/api/attendance/capture-photos/${sessionId}`);

            setCaptureStats(prev => ({
                total: prev.total + 1,
                successful: prev.successful + 1,
                failed: prev.failed
            }));

            console.log(`[Auto-Capture] Success: ${captureResponse.data.totalPhotos} total photos`);

            // Auto-process if enabled
            if (autoProcessEnabled) {
                const processResponse = await api.post(`/api/attendance/process-session/${sessionId}`);
                console.log(`[Auto-Process] ${processResponse.data.newlyMarked} newly marked`);
            }

            fetchSessionDetails();
        } catch (error) {
            console.error('[Auto-Capture] Failed:', error);
            setCaptureStats(prev => ({
                total: prev.total + 1,
                successful: prev.successful,
                failed: prev.failed + 1
            }));
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera();
            stopAutomatedCapture();
        };
    }, []);

    const handleCloseSession = async () => {
        if (!confirm('Are you sure you want to close this session? No more captures will be allowed.')) return;

        try {
            await api.post(`/api/attendance/close-session/${sessionId}`);
            alert('Session closed successfully');
            fetchSessionDetails();
        } catch (error) {
            alert('Failed to close session');
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    if (loading) {
        return (
            <AdminLayout onLogout={handleLogout}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Loading session...</h2>
                </div>
            </AdminLayout>
        );
    }

    if (!session) {
        return (
            <AdminLayout onLogout={handleLogout}>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Session not found</h2>
                    <button onClick={() => navigate('/admin/dashboard')} style={{ marginTop: '20px' }}>
                        Back to Dashboard
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const now = new Date();
    const isActive = now >= new Date(session.startTime) && now <= new Date(session.endTime) && !session.isClosed;

    return (
        <AdminLayout onLogout={handleLogout}>
            <div>
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{
                        marginBottom: '20px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ← Back to Dashboard
                </button>

                <h1>{session.sessionName}</h1>
                <p className="subtitle">{session.subjectCode} - {session.subjectName}</p>

                <div className="info-grid" style={{ marginTop: '20px' }}>
                    <div className="info-item">
                        <div className="info-label">Status</div>
                        <div className="info-value">{session.status}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Start Time</div>
                        <div className="info-value">{new Date(session.startTime).toLocaleString()}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">End Time</div>
                        <div className="info-value">{new Date(session.endTime).toLocaleString()}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Captures</div>
                        <div className="info-value">{session.captureCount || 0}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Total Photos</div>
                        <div className="info-value">{session.totalPhotos}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Students Recognized</div>
                        <div className="info-value">{session.studentsRecognized}</div>
                    </div>
                </div>

                {isActive && (
                    <div style={{ marginTop: '20px', background: '#d4edda', padding: '20px', borderRadius: '10px', border: '2px solid #28a745' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#155724' }}>🟢 Session Active</h3>

                        {/* Automated Capture Mode */}
                        {!showManualCapture && !autoCaptureEnabled && (
                            <div style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '10px', border: '2px solid #007bff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <h4 style={{ margin: 0, color: '#007bff' }}>🤖 Automated Continuous Capture</h4>
                                    <button
                                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                        style={{ background: '#6c757d', padding: '5px 15px', fontSize: '12px' }}
                                    >
                                        {showAdvancedSettings ? '▼ Hide Settings' : '▶ Advanced Settings'}
                                    </button>
                                </div>

                                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                                    Set up ESP32-CAM once and let the system automatically capture photos throughout the session
                                </p>

                                {showAdvancedSettings && (
                                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                                                Capture Interval (seconds)
                                            </label>
                                            <input
                                                type="number"
                                                value={captureInterval}
                                                onChange={(e) => setCaptureInterval(Math.max(30, parseInt(e.target.value) || 120))}
                                                min="30"
                                                max="600"
                                                style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }}
                                            />
                                            <small style={{ color: '#666' }}>Photos will be captured every {captureInterval} seconds (30-600s)</small>
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={autoProcessEnabled}
                                                    onChange={(e) => setAutoProcessEnabled(e.target.checked)}
                                                    style={{ width: '18px', height: '18px' }}
                                                />
                                                <span style={{ fontSize: '14px' }}>
                                                    Auto-process faces after each capture (Recommended)
                                                </span>
                                            </label>
                                            <small style={{ display: 'block', marginLeft: '28px', color: '#666' }}>
                                                Automatically recognize faces and mark attendance after each capture
                                            </small>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={startAutomatedCapture}
                                    disabled={capturing || processing}
                                    style={{ background: '#007bff', width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    🚀 Start Automated Capture Mode
                                </button>
                            </div>
                        )}

                        {/* Automated Capture Active */}
                        {autoCaptureEnabled && (
                            <div style={{ marginBottom: '20px', background: '#fff3cd', padding: '20px', borderRadius: '10px', border: '2px solid #ffc107' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>
                                    🔄 Automated Capture Running...
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                                            {captureStats.total}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Total Captures</div>
                                    </div>
                                    <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                            {captureStats.successful}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Successful</div>
                                    </div>
                                    <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                                            {captureStats.failed}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Failed</div>
                                    </div>
                                </div>

                                <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px' }}>
                                    <div>📸 Interval: Every {captureInterval} seconds</div>
                                    <div>🤖 Auto-process: {autoProcessEnabled ? 'Enabled' : 'Disabled'}</div>
                                    <div>👥 Students Marked: {session.studentsRecognized || 0}</div>
                                </div>

                                <button
                                    onClick={stopAutomatedCapture}
                                    style={{ background: '#dc3545', width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
                                >
                                    ⏹️ Stop Automated Capture
                                </button>
                            </div>
                        )}

                        {/* Manual Controls */}
                        {!showManualCapture && !autoCaptureEnabled && (
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>Manual Capture</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleCapture}
                                        disabled={capturing || processing}
                                        style={{ background: '#28a745' }}
                                    >
                                        {capturing ? 'Checking ESP32...' : processing ? 'Processing...' : '📸 Capture Once'}
                                    </button>
                                    <button
                                        onClick={handleCloseSession}
                                        style={{ background: '#dc3545' }}
                                    >
                                        Close Session
                                    </button>
                                </div>
                            </div>
                        )}

                        {showManualCapture && !autoCaptureEnabled && (
                            <div>
                                <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>📷 Camera Capture</h4>

                                <div style={{ marginBottom: '15px' }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        style={{
                                            width: '100%',
                                            maxWidth: '640px',
                                            borderRadius: '10px',
                                            border: '2px solid #28a745'
                                        }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <button
                                        onClick={capturePhoto}
                                        disabled={!stream}
                                        style={{ background: '#28a745' }}
                                    >
                                        📸 Capture Photo
                                    </button>
                                    <button
                                        onClick={() => {
                                            stopCamera();
                                            setShowManualCapture(false);
                                            setCapturedPhotos([]);
                                        }}
                                        style={{ background: '#6c757d' }}
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {capturedPhotos.length > 0 && (
                                    <div>
                                        <h5 style={{ margin: '10px 0', color: '#155724' }}>
                                            Captured Photos ({capturedPhotos.length})
                                        </h5>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                            gap: '10px',
                                            marginBottom: '15px'
                                        }}>
                                            {capturedPhotos.map((photo, idx) => (
                                                <div key={idx} style={{ position: 'relative' }}>
                                                    <img
                                                        src={photo}
                                                        alt={`Captured ${idx + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '150px',
                                                            objectFit: 'cover',
                                                            borderRadius: '5px',
                                                            border: '1px solid #28a745'
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => removePhoto(idx)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '5px',
                                                            right: '5px',
                                                            background: '#dc3545',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '25px',
                                                            height: '25px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={uploadCapturedPhotos}
                                            disabled={capturing || processing}
                                            style={{ background: '#28a745' }}
                                        >
                                            {capturing ? 'Uploading...' : processing ? 'Processing...' : `Upload ${capturedPhotos.length} Photo(s) & Process`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {session.isClosed && (
                    <div style={{ marginTop: '20px', background: '#f8d7da', padding: '15px', borderRadius: '10px', border: '1px solid #dc3545' }}>
                        <p style={{ margin: 0, color: '#721c24' }}>
                            🔒 Session is closed. No more captures allowed.
                        </p>
                    </div>
                )}

                {session.recognizedStudents && session.recognizedStudents.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Recognized Students ({session.studentsRecognized})</h3>
                        <div style={{ marginTop: '15px' }}>
                            {session.recognizedStudents.map((student, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: 'white',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '15px',
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <img
                                            src={student.bestPhotoUrl}
                                            alt={student.name}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '10px'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{student.name}</h4>
                                            <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                                                Reg: {student.registrationNumber}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '14px' }}>
                                                Confidence: {(student.confidence * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                        <div style={{
                                            padding: '8px 15px',
                                            background: '#d4edda',
                                            color: '#155724',
                                            borderRadius: '5px',
                                            fontWeight: 'bold'
                                        }}>
                                            ✓ Present
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {session.photos && session.photos.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Captured Photos ({session.totalPhotos})</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '15px',
                            marginTop: '15px'
                        }}>
                            {session.photos.map((photo, idx) => (
                                <div key={idx} className="photo-card">
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${idx + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '10px'
                                        }}
                                    />
                                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                                        Photo {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default SessionDetails;
