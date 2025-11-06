import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import AdminLayout from '../../components/AdminLayout';

function Subjects({ setAdminToken }) {
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await api.get('/api/subjects/all');
            setSubjects(response.data.subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await api.post('/api/subjects/create', formData);
            setFormData({ name: '', code: '', description: '' });
            setShowForm(false);
            fetchSubjects();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create subject');
        }
    };

    const handleDelete = async (subjectId) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;

        try {
            await api.delete(`/api/subjects/${subjectId}`);
            fetchSubjects();
        } catch (error) {
            alert('Failed to delete subject');
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    return (
        <AdminLayout onLogout={handleLogout}>
            <div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#1e3c72' }}>Subjects</h1>
                <p style={{ margin: '0 0 30px 0', color: '#666' }}>Create and manage lecture subjects</p>

                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ marginTop: '20px', background: '#28a745' }}
                >
                    {showForm ? 'Cancel' : '+ Add New Subject'}
                </button>

                {showForm && (
                    <div style={{
                        background: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '10px',
                        marginTop: '20px'
                    }}>
                        <h3>Create New Subject</h3>
                        {error && <div className="error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Subject Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Computer Science 101"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g., CS101"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the subject"
                                    rows="3"
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #e0e0e0' }}
                                />
                            </div>

                            <button type="submit" style={{ background: '#28a745' }}>
                                Create Subject
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ marginTop: '30px' }}>
                    <h3>All Subjects</h3>
                    {subjects.length === 0 ? (
                        <p style={{ color: '#666', marginTop: '10px' }}>No subjects created yet</p>
                    ) : (
                        <div style={{ marginTop: '15px' }}>
                            {subjects.map(subject => (
                                <div
                                    key={subject._id}
                                    style={{
                                        background: 'white',
                                        padding: '20px',
                                        borderRadius: '10px',
                                        marginBottom: '15px',
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 5px 0' }}>{subject.name}</h4>
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
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => navigate(`/admin/attendance-sheet/${subject._id}`)}
                                                style={{
                                                    background: '#007bff',
                                                    padding: '8px 15px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                📊 Attendance Sheet
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject._id)}
                                                style={{
                                                    background: '#dc3545',
                                                    padding: '8px 15px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export default Subjects;
