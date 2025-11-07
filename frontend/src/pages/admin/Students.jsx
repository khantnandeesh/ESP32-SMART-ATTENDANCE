import { useState, useEffect } from 'react';
import api from '../../config/api';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

function Students({ setAdminToken }) {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/api/student/all');
            setStudents(response.data.students || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    const filteredStudents = students.filter(student =>
        student.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const viewStudentDetails = async (regNumber) => {
        try {
            const response = await api.get(`/api/student/attendance/${regNumber}`);
            setSelectedStudent(response.data);
        } catch (error) {
            console.error('Error fetching student details:', error);
            alert('Failed to fetch student details');
        }
    };

    return (
        <AdminLayout onLogout={handleLogout}>
            <div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#1e3c72' }}>Students</h1>
                <p style={{ margin: '0 0 30px 0', color: '#666' }}>Search and view student attendance records</p>

                {/* Search Bar */}
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by registration number, name, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '15px 20px',
                            fontSize: '16px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '10px',
                            outline: 'none',
                            transition: 'border 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2a5298'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                        Loading students...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1fr' : '1fr', gap: '30px' }}>
                        {/* Students List */}
                        <div>
                            <h3 style={{ marginBottom: '15px', color: '#333' }}>
                                {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''} Found
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {filteredStudents.map(student => (
                                    <div
                                        key={student._id}
                                        onClick={() => viewStudentDetails(student.registrationNumber)}
                                        style={{
                                            background: 'white',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            border: selectedStudent?.student?.registrationNumber === student.registrationNumber
                                                ? '2px solid #2a5298'
                                                : '2px solid transparent',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#1e3c72' }}>
                                                    {student.name}
                                                </h4>
                                                <p style={{ margin: '0 0 3px 0', color: '#666', fontSize: '14px' }}>
                                                    📋 {student.registrationNumber}
                                                </p>
                                                <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>
                                                    ✉️ {student.email}
                                                </p>
                                            </div>
                                            <div style={{
                                                background: student.hasPhotos ? '#d4edda' : '#fff3cd',
                                                color: student.hasPhotos ? '#155724' : '#856404',
                                                padding: '8px 15px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {student.hasPhotos ? '✓ Enrolled' : '⚠ Pending'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Student Details */}
                        {selectedStudent && (
                            <div>
                                <div style={{
                                    background: 'white',
                                    padding: '25px',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    position: 'sticky',
                                    top: '30px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#1e3c72' }}>
                                                {selectedStudent.student.name}
                                            </h3>
                                            <p style={{ margin: 0, color: '#666' }}>
                                                {selectedStudent.student.registrationNumber}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStudent(null)}
                                            style={{
                                                background: '#f0f0f0',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                fontSize: '18px'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '15px',
                                        marginBottom: '25px'
                                    }}>
                                        <div style={{
                                            background: '#f8f9fa',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
                                                {selectedStudent.attendanceRecords?.length || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                Total Attendance
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#f8f9fa',
                                            padding: '15px',
                                            borderRadius: '8px',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2a5298' }}>
                                                {selectedStudent.student.photos?.length || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                                Photos Enrolled
                                            </div>
                                        </div>
                                    </div>

                                    <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Attendance History</h4>
                                    {selectedStudent.attendanceRecords && selectedStudent.attendanceRecords.length > 0 ? (
                                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            {selectedStudent.attendanceRecords.map((record, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '15px',
                                                        background: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        marginBottom: '10px',
                                                        borderLeft: '4px solid #28a745'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 'bold', color: '#1e3c72', marginBottom: '5px' }}>
                                                        {record.sessionName}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '5px' }}>
                                                        📅 {new Date(record.markedAt).toLocaleString()}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#28a745' }}>
                                                        ✓ Confidence: {(record.confidence * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                            No attendance records yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default Students;
