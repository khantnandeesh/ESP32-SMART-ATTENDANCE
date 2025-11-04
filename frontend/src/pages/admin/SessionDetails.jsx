import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';

function SessionDetails() {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessionDetails();
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

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <h1>Loading...</h1>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container">
                <div className="card">
                    <h1>Session not found</h1>
                    <button onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ marginBottom: '20px', background: '#6c757d' }}
                >
                    ← Back to Dashboard
                </button>

                <h1>{session.sessionName}</h1>
                <p className="subtitle">{new Date(session.createdAt).toLocaleString()}</p>

                <div className="info-grid" style={{ marginTop: '20px' }}>
                    <div className="info-item">
                        <div className="info-label">Status</div>
                        <div className="info-value">{session.status}</div>
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

                {session.recognizedStudents && session.recognizedStudents.length > 0 && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Recognized Students</h3>
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
                        <h3>Captured Photos</h3>
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
        </div>
    );
}

export default SessionDetails;
