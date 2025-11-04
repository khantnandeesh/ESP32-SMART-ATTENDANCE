import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

function ViewPhotos() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPhotos();
    }, []);

    const fetchPhotos = async () => {
        try {
            const response = await api.get('/api/photos/my-photos');
            setPhotos(response.data.photos);
        } catch (err) {
            setError('Failed to load photos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="card">
                    <h1>Loading photos...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>My Photos</h1>
                <p className="subtitle">All your uploaded photos for facial recognition</p>

                {error && <div className="error">{error}</div>}

                {photos.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                        <p>No photos uploaded yet</p>
                        <button onClick={() => navigate('/capture-photos')} style={{ marginTop: '20px' }}>
                            Upload Photos
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '20px',
                            marginTop: '30px'
                        }}>
                            {photos.map((photo, index) => (
                                <div key={photo.publicId || index} className="photo-card">
                                    <img
                                        src={photo.url}
                                        alt={`Photo ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'cover',
                                            borderRadius: '10px'
                                        }}
                                    />
                                    <div style={{
                                        marginTop: '10px',
                                        fontSize: '12px',
                                        color: '#666',
                                        textAlign: 'center'
                                    }}>
                                        Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <p style={{ color: '#666', marginBottom: '15px' }}>
                                Total Photos: {photos.length}
                            </p>
                            <button onClick={() => navigate('/capture-photos')}>
                                Add More Photos
                            </button>
                        </div>
                    </>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    style={{ marginTop: '20px', background: '#6c757d' }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default ViewPhotos;
