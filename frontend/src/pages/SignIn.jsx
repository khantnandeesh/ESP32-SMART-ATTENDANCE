import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../config/api';

function SignIn({ setToken }) {
<<<<<<< HEAD
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        registrationNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

=======
    const [step, setStep] = useState(1); // 1: Enter details, 2: Verify OTP
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    // Timer for resend OTP
    useState(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z]+\.\d{8}@mnnit\.ac\.in$/;
        return emailRegex.test(email);
    };

    const extractRegistrationNumber = (email) => {
        const match = email.match(/\.(\d{8})@/);
        return match ? match[1] : null;
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate email format
        if (!validateEmail(formData.email)) {
            setError('Email must be in format: name.12345678@mnnit.ac.in');
            return;
        }

        // Validate passwords
>>>>>>> harsh_sharma
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...dataToSend } = formData;
<<<<<<< HEAD
            const response = await api.post('/api/auth/signin', dataToSend);
            setToken(response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Sign in failed');
=======
            const response = await api.post('/api/auth/request-otp', dataToSend);
            
            setRegistrationNumber(response.data.registrationNumber);
            setSuccess('OTP sent to your email! Please check your inbox.');
            setStep(2);
            setTimer(600); // 10 minutes
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
>>>>>>> harsh_sharma
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
=======
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/verify-otp', {
                email: formData.email,
                otp
            });
            
            setToken(response.data.token);
            setSuccess('Registration successful! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        setResendLoading(true);

        try {
            await api.post('/api/auth/resend-otp', {
                email: formData.email
            });
            
            setSuccess('OTP resent successfully! Please check your email.');
            setTimer(600);
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

>>>>>>> harsh_sharma
    return (
        <div className="container">
            <div className="card">
                <h1>Sign In</h1>
<<<<<<< HEAD
                <p className="subtitle">Create your account for Smart Attendance</p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>College Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@college.edu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Registration Number (8 digits)</label>
                        <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            placeholder="12345678"
                            pattern="\d{8}"
                            maxLength="8"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password (min 6 characters)"
                            minLength="6"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            minLength="6"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
=======
                <p className="subtitle">
                    {step === 1 
                        ? 'Create your account for Smart Attendance' 
                        : 'Verify your email address'}
                </p>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>MNNIT Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name.12345678@mnnit.ac.in"
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>
                                Format: name.12345678@mnnit.ac.in (8 digits are your registration number)
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password (min 6 characters)"
                                minLength="6"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                minLength="6"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                                Email: <strong>{formData.email}</strong>
                            </p>
                            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                                Registration Number: <strong>{registrationNumber}</strong>
                            </p>
                        </div>

                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 6) {
                                        setOtp(value);
                                        setError('');
                                    }
                                }}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                style={{ 
                                    fontSize: '24px', 
                                    letterSpacing: '8px', 
                                    textAlign: 'center' 
                                }}
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px' }}>
                                Check your email for the OTP. It expires in {formatTime(timer)}
                            </small>
                        </div>

                        <button type="submit" disabled={loading || timer === 0}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={resendLoading || timer > 540} // Can resend after 1 minute
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: timer > 540 ? '#ccc' : '#667eea',
                                    cursor: timer > 540 ? 'not-allowed' : 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px'
                                }}
                            >
                                {resendLoading ? 'Resending...' : 'Resend OTP'}
                            </button>
                            {timer > 540 && (
                                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 0' }}>
                                    You can resend OTP after {formatTime(timer - 540)}
                                </p>
                            )}
                        </div>

                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp('');
                                    setError('');
                                    setSuccess('');
                                    setTimer(0);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ← Back to registration
                            </button>
                        </div>
                    </form>
                )}
>>>>>>> harsh_sharma

                <div className="link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>
            </div>
<<<<<<< HEAD
=======

            <style jsx>{`
                .success {
                    background-color: #d4edda;
                    color: #155724;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    border: 1px solid #c3e6cb;
                }
            `}</style>
>>>>>>> harsh_sharma
        </div>
    );
}

<<<<<<< HEAD
export default SignIn;
=======
export default SignIn;
>>>>>>> harsh_sharma
