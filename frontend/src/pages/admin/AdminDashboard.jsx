import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

function AdminDashboard({ adminToken, setAdminToken }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [sessionName, setSessionName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/api/attendance/sessions');
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const handleCreateAndCapture = async () => {
        if (!sessionName.trim()) {
            alert('Please enter a session name');
            return;
        }

        setCapturing(true);

        try {
            // Create session
            const createResponse = await api.post('/api/attendance/create-session', {
                sessionName: sessionName.trim()
            });

            const sessionId = createResponse.data.sessionId;
            setCurrentSession(sessionId);

            // Capture 2 photos
            const captureResponse = await api.post(`/api/attendance/capture-photos/${sessionId}`);

            alert(`Captured ${captureResponse.data.totalPhotos} photos successfully!`);

            // Process attendance
            setProcessing(true);
            const processResponse = await api.post(`/api/attendance/process-session/${sessionId}`);

            alert(`Attendance processed! ${processResponse.data.studentsRecognized} students recognized.`);

            setSessionName('');
            setCurrentSession(null);
            fetchSessions();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to capture attendance');
        } finally {
            setCapturing(false);
            setProcessing(false);
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Smart Attendance System</p>

                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    marginTop: '20px'
                }}>
                    <h3 style={{ marginBottom: '15px' }}>Capture Attendance</h3>

                    <div className="form-group">
                        <label>Session Name</label>
                        <input
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            placeholder="e.g., Morning Class - CS101"
                            disabled={capturing || processing}
                        />
                    </div>

                    <button
                        onClick={handleCreateAndCapture}
                        disabled={capturing || processing || !sessionName.trim()}
                        style={{ background: '#28a745', marginTop: '10px' }}
                    >
                        {capturing ? 'Capturing 2 Photos...' : processing ? 'Processing Faces...' : 'Capture Attendance'}
                    </button>

                    {(capturing || processing) && (
                        <div style={{
                            marginTop: '15px',
                            padding: '10px',
                            background: '#fff3cd',
                            borderRadius: '5px',
                            color: '#856404'
                        }}>
                            {capturing && '📸 Capturing photos from ESP32-CAM...'}
                            {processing && '🔍 Processing faces and recognizing students...'}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '30px' }}>
                    <h3>Recent Sessions</h3>
                    {sessions.length === 0 ? (
                        <p style={{ color: '#666', marginTop: '10px' }}>No sessions yet</p>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {sessions.map(session => (
                                <div
                                    key={session._id}
                                    style={{
                                        background: 'white',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '10px',
                                        border: '1px solid #e0e0e0',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/admin/session/${session._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{session.sessionName}</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                                {new Date(session.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                background: session.status === 'completed' ? '#d4edda' : '#fff3cd',
                                                color: session.status === 'completed' ? '#155724' : '#856404',
                                                fontSize: '12px',
                                                marginBottom: '5px'
                                            }}>
                                                {session.status}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
                                                {session.studentsRecognized || 0} students
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '20px' }}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default AdminDashboard;
