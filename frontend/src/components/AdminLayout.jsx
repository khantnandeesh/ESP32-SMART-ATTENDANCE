import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AdminLayout({ children, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/admin/sessions', icon: '📅', label: 'Sessions' },
        { path: '/admin/students', icon: '👥', label: 'Students' },
        { path: '/admin/subjects', icon: '📚', label: 'Subjects' },
        { path: '/admin/reports', icon: '📈', label: 'Reports' }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
            {/* Sidebar */}
            <div style={{
                width: isSidebarOpen ? '250px' : '70px',
                background: 'linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)',
                color: 'white',
                transition: 'width 0.3s',
                position: 'fixed',
                height: '100vh',
                overflowY: 'auto',
                boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {isSidebarOpen && (
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Smart Attendance</h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>Admin Panel</p>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                <nav style={{ padding: '20px 0' }}>
                    {menuItems.map(item => (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                padding: '15px 20px',
                                cursor: 'pointer',
                                background: isActive(item.path) ? 'rgba(255,255,255,0.15)' : 'transparent',
                                borderLeft: isActive(item.path) ? '4px solid white' : '4px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{item.icon}</span>
                            {isSidebarOpen && <span style={{ fontSize: '15px' }}>{item.label}</span>}
                        </div>
                    ))}
                </nav>

                <div style={{ position: 'absolute', bottom: '20px', width: '100%', padding: '0 20px' }}>
                    <button
                        onClick={onLogout}
                        style={{
                            width: isSidebarOpen ? 'calc(100% - 40px)' : '40px',
                            padding: '12px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        <span>🚪</span>
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                marginLeft: isSidebarOpen ? '250px' : '70px',
                flex: 1,
                transition: 'margin-left 0.3s',
                padding: '30px',
                minHeight: '100vh'
            }}>
                {children}
            </div>
        </div>
    );
}

export default AdminLayout;
