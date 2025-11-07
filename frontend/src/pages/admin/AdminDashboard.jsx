import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
<<<<<<< HEAD

function AdminDashboard({ adminToken, setAdminToken }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [sessionName, setSessionName] = useState('');
=======
import AdminLayout from '../../components/AdminLayout';

function AdminDashboard({ adminToken, setAdminToken }) {
    const [sessions, setSessions] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');
>>>>>>> harsh_sharma
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
<<<<<<< HEAD
=======
        fetchActiveSessions();
        fetchSubjects();
>>>>>>> harsh_sharma
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/api/attendance/sessions');
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

<<<<<<< HEAD
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
=======
    const fetchActiveSessions = async () => {
        try {
            const response = await api.get('/api/attendance/active-sessions');
            setActiveSessions(response.data.sessions);
        } catch (error) {
            console.error('Error fetching active sessions:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/api/subjects/all');
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleCreateSession = async () => {
        if (!selectedSubject || !startTime || !endTime) {
            setError('Please select subject and set start/end times');
            return;
        }

        try {
            const response = await api.post('/api/attendance/create-session', {
                subjectId: selectedSubject,
                startTime,
                endTime
            });

            alert(`Session created: ${response.data.session.sessionName}`);
            setSelectedSubject('');
            setStartTime('');
            setEndTime('');
            setError('');
            fetchSessions();
            fetchActiveSessions();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create session');
>>>>>>> harsh_sharma
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    return (
<<<<<<< HEAD
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p className="subtitle">Smart Attendance System</p>
=======
        <AdminLayout onLogout={handleLogout}>
            <div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#1e3c72' }}>Dashboard</h1>
                <p style={{ margin: '0 0 30px 0', color: '#666' }}>Manage attendance sessions and monitor system activity</p>

                {subjects.length === 0 && (
                    <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '10px', marginTop: '20px', border: '1px solid #ffc107' }}>
                        <p style={{ margin: 0, color: '#856404' }}>
                            ⚠️ No subjects created yet. Please create subjects first.
                        </p>
                    </div>
                )}
>>>>>>> harsh_sharma

                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px',
                    marginTop: '20px'
                }}>
<<<<<<< HEAD
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
=======
                    <h3 style={{ marginBottom: '15px' }}>Create Attendance Session</h3>

                    {error && <div className="error">{error}</div>}

                    <div className="form-group">
                        <label>Select Subject</label>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '2px solid #e0e0e0',
                                fontSize: '16px'
                            }}
                        >
                            <option value="">-- Select Subject --</option>
                            {subjects.map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.code} - {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '2px solid #e0e0e0'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '2px solid #e0e0e0'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleCreateSession}
                        disabled={!selectedSubject || !startTime || !endTime}
                        style={{ background: '#28a745', marginTop: '10px' }}
                    >
                        Create Session
                    </button>
                </div>

                {activeSessions.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Active Sessions</h3>
                        <div style={{ marginTop: '15px' }}>
                            {activeSessions.map(session => (
                                <div
                                    key={session._id}
                                    style={{
                                        background: '#d4edda',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        marginBottom: '10px',
                                        border: '2px solid #28a745',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/admin/session/${session._id}`)}
                                >
                                    <h4 style={{ margin: '0 0 5px 0', color: '#155724' }}>
                                        🟢 {session.sessionName}
                                    </h4>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#155724' }}>
                                        {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                                    </p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#155724' }}>
                                        {session.studentsRecognized || 0} students marked | {session.captureCount || 0} captures
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '30px' }}>
                    <h3>All Sessions</h3>
>>>>>>> harsh_sharma
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
<<<<<<< HEAD
                                                background: session.status === 'completed' ? '#d4edda' : '#fff3cd',
                                                color: session.status === 'completed' ? '#155724' : '#856404',
=======
                                                background: session.status === 'closed' ? '#d4edda' : session.status === 'active' ? '#fff3cd' : '#f8d7da',
                                                color: session.status === 'closed' ? '#155724' : session.status === 'active' ? '#856404' : '#721c24',
>>>>>>> harsh_sharma
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

<<<<<<< HEAD
                <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '20px' }}>
                    Logout
                </button>
            </div>
        </div>
=======
            </div>
        </AdminLayout>
>>>>>>> harsh_sharma
    );
}

export default AdminDashboard;
