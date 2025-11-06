import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

function Reports({ setAdminToken }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        setAdminToken(null);
        navigate('/admin/login');
    };

    return (
        <AdminLayout onLogout={handleLogout}>
            <div>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#1e3c72' }}>Reports</h1>
                <p style={{ margin: '0 0 30px 0', color: '#666' }}>Generate and view attendance reports</p>

                <div style={{
                    background: 'white',
                    padding: '50px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
                    <h2 style={{ color: '#666', marginBottom: '10px' }}>Reports Coming Soon</h2>
                    <p style={{ color: '#999' }}>
                        This feature will allow you to generate detailed attendance reports,
                        export data, and analyze attendance patterns.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Reports;
