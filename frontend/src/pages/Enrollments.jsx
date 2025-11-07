import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

function Enrollments({ setToken }) {
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [available, enrolled] = await Promise.all([
                api.get('/api/subjects/available'),
                api.get('/api/subjects/my-enrollments')
            ]);
            setAvailableSubjects(available.data.subjects);
            setEnrolledSubjects(enrolled.data.enrolledSubjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (subjectId) => {
        try {
            await api.post(`/api/subjects/enroll/${subjectId}`);
            alert('Successfully enrolled!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to enroll');
        }
    };

    const handleUnenroll = async (subjectId) => {
        if (!confirm('Are you sure you want to unenroll from this subject?')) return;

        try {
            await api.post(`/api/subjects/unenroll/${subjectId}`);
            alert('Successfully unenrolled');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to unenroll');
        }
    };

    const isEnrolled = (subjectId) => {
        return enrolledSubjects.some(e => e.subjectId._id === subjectId);
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
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ marginBottom: '20px', background: '#6c757d' }}
                >
                    ← Back to Dashboard
                </button>

                <h1>Course Enrollments</h1>
                <p className="subtitle">Enroll in subjects to track your attendance</p>

                {/* Enrolled Subjects */}
                <div style={{ marginTop: '30px' }}>
                    <h3>My Enrolled Subjects ({enrolledSubjects.length})</h3>
                    {enrolledSubjects.length === 0 ? (
                        <p style={{ color: '#666', marginTop: '10px' }}>
                            You haven't enrolled in any subjects yet
                        </p>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {enrolledSubjects.map(enrollment => (
                                <div
                                    key={enrollment.subjectId._id}
                                    style={{
                                        background: '#d4edda',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        marginBottom: '15px',
                                        border: '2px solid #28a745'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0' }}>
                                                ✓ {enrollment.subjectName}
                                            </h4>
                                            <p style={{ margin: 0, color: '#155724', fontSize: '14px' }}>
                                                Code: <strong>{enrollment.subjectCode}</strong>
                                            </p>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#155724' }}>
                                                Enrolled on: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnenroll(enrollment.subjectId._id)}
                                            style={{
                                                background: '#dc3545',
                                                padding: '8px 15px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Unenroll
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Available Subjects */}
                <div style={{ marginTop: '40px' }}>
                    <h3>Available Subjects</h3>
                    {availableSubjects.length === 0 ? (
                        <p style={{ color: '#666', marginTop: '10px' }}>
                            No subjects available for enrollment
                        </p>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {availableSubjects.map(subject => {
                                const enrolled = isEnrolled(subject._id);
                                return (
                                    <div
                                        key={subject._id}
                                        style={{
                                            background: enrolled ? '#f8f9fa' : 'white',
                                            padding: '20px',
                                            borderRadius: '10px',
                                            marginBottom: '15px',
                                            border: enrolled ? '1px solid #e0e0e0' : '2px solid #007bff',
                                            opacity: enrolled ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ margin: '0 0 5px 0' }}>
                                                    {subject.name}
                                                </h4>
                                                <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                                                    Code: <strong>{subject.code}</strong>
                                                </p>
                                                {subject.description && (
                                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                                                        {subject.description}
                                                    </p>
                                                )}
                                                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                                                    {subject.totalEnrolled || 0} students enrolled
                                                </p>
                                            </div>
                                            {!enrolled && (
                                                <button
                                                    onClick={() => handleEnroll(subject._id)}
                                                    style={{
                                                        background: '#28a745',
                                                        padding: '10px 20px',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    Enroll Now
                                                </button>
                                            )}
                                            {enrolled && (
                                                <div style={{
                                                    background: '#28a745',
                                                    color: 'white',
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    fontSize: '14px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓ Enrolled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Enrollments;
