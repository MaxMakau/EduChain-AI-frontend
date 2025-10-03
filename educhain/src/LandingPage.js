import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
    padding: '20px',
  };

  const logoStyle = {
    fontSize: '3rem',
    color: 'var(--color-secondary)', // Green for professionalism/growth
    marginBottom: '10px',
  };

  const headingStyle = {
    fontSize: '2.5rem',
    color: 'var(--color-primary)', // Blue for trust/security
    marginBottom: '20px',
  };

  const taglineStyle = {
    fontSize: '1.2rem',
    color: 'var(--color-text)',
    maxWidth: '600px',
    marginBottom: '40px',
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: '20px',
  };
  
  const linkButtonStyle = {
    padding: '12px 30px',
    borderRadius: 'var(--border-radius)',
    textDecoration: 'none',
    fontWeight: '700',
    transition: 'background-color 0.2s, transform 0.1s',
  };

  const loginButtonStyle = {
    ...linkButtonStyle,
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
  };

  const signupButtonStyle = {
    ...linkButtonStyle,
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-white)',
  };


  return (
    <div style={containerStyle}>
      <div style={logoStyle}>👨‍🏫</div>
      <h1 style={headingStyle}>EduChain AI</h1>
      <p style={taglineStyle}>
        Digitalizing school operations and empowering stakeholders—from parents and teachers to county officers—with transparency, real-time data, and secure communication.
      </p>
      
      <div style={buttonGroupStyle}>
        <Link to="/login" style={loginButtonStyle}>
          Log In
        </Link>
        <Link to="/signup" style={signupButtonStyle}>
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
