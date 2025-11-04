import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

function Dashboard({ token, setToken }) {
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudentData();
    }, []);

    const fetchStudentData = async () => {
        try {
            const response = await api.get('/api/student/me');
            console.log(response.data,"student data");
            setStudent(response.data);

            if (!response.data.hasPhotos) {
                navigate('/capture-photos');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            setToken(null);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateEmbeddings = async () => {
        try {
            setLoading(true);
            const response = await api.post('/api/student/generate-embeddings');
            alert(response.data.message);
            fetchStudentData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to generate embeddings');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setToken(null);
        navigate('/login');
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome, {student?.name}!</h1>
                <p className="subtitle">Smart Attendance System Dashboard</p>

                <div className="info-grid">
                    <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{student?.email}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Registration Number</div>
                        <div className="info-value">{student?.registrationNumber}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Photos Uploaded</div>
                        <div className="info-value">{student?.photoCount} photos</div>
                    </div>
                    <div className="info-item">
                        <div className="info-label">Status</div>
                        <div className="info-value">{student?.hasPhotos ? '✓ Active' : 'Pending Photos'}</div>
                    </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                    {student?.hasPhotos && !student?.embeddingsGenerated && (
                        <div style={{
                            background: '#fff3cd',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            border: '1px solid #ffc107'
                        }}>
                            <p style={{ margin: '0 0 10px 0', color: '#856404' }}>
                                ⚠️ Face embeddings not generated yet. Generate them to enable attendance.
                            </p>
                            <button onClick={handleGenerateEmbeddings} style={{ background: '#ffc107', color: '#000' }}>
                                Generate Face Embeddings
                            </button>
                        </div>
                    )}

                    {student?.embeddingsGenerated && (
                        <div style={{
                            background: '#d4edda',
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '15px',
                            border: '1px solid #28a745'
                        }}>
                            <p style={{ margin: 0, color: '#155724' }}>
                                ✓ Face embeddings generated ({student?.embeddingsCount} embeddings)
                            </p>
                        </div>
                    )}

                    {student?.attendanceRecords && student.attendanceRecords.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h3>Your Attendance Records</h3>
                            <div style={{ marginTop: '15px' }}>
                                {student.attendanceRecords.slice(-5).reverse().map((record, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: '#d4edda',
                                            padding: '15px',
                                            borderRadius: '10px',
                                            marginBottom: '10px',
                                            border: '1px solid #28a745'
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            <img
                                                src={record.photoUrl}
                                                alt="Attendance"
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0', color: '#155724' }}>
                                                    ✓ {record.sessionName}
                                                </h4>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#155724' }}>
                                                    Recognized at: {new Date(record.markedAt).toLocaleString()}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#155724' }}>
                                                    Confidence: {(record.confidence * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
                        {!student?.hasPhotos ? (
                            <button onClick={() => navigate('/capture-photos')}>
                                Upload Photos
                            </button>
                        ) : (
                            <>
                                <button onClick={() => navigate('/view-photos')}>
                                    View My Photos ({student?.photoCount})
                                </button>
                                <button onClick={() => navigate('/capture-photos')} style={{ background: '#28a745' }}>
                                    Add More Photos
                                </button>
                            </>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
