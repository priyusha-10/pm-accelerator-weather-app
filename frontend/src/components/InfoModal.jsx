import React from 'react';

const InfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '2rem',
                borderRadius: '20px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                color: 'white',
                position: 'relative'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>About Weather AI</h2>
                
                <p style={{ lineHeight: '1.6' }}>
                    This application was built by <strong>Antigravity</strong> (Google Deepmind) as part of the Technical Assessment.
                </p>

                <div style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    borderRadius: '12px' 
                }}>
                    <h3 style={{ marginTop: 0 }}>Product Manager Accelerator</h3>
                    <p style={{ fontSize: '0.95rem', opacity: 0.9, lineHeight: '1.5' }}>
                        The Product Manager Accelerator allows you to learn the skills, build the experience, and get the mentorship you need to land your dream Product Manager job.
                    </p>
                    
                    {/* Rich Media: YouTube Embed */}
                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                        <iframe 
                            width="100%" 
                            height="200" 
                            src="https://www.youtube.com/embed/LXb3EKWsInQ" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                    <a 
                        href="https://www.linkedin.com/company/product-manager-accelerator/" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                            display: 'inline-block',
                            marginTop: '1rem',
                            color: '#646cff',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        Visit LinkedIn Page &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
