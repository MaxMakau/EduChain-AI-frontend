import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../api/auth';

const OnboardingPage = () => {
  const { user, isAuthenticated, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated OR if role is already set
  if (!isAuthenticated || isLoading) {
    return <Navigate to="/login" replace />;
  }
  if (user && user.role) {
    navigate(`/dashboard/${user.role.toLowerCase()}`, { replace: true });
    return null;
  }
  
  const handleOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- TEST POST ONBOARDING ENDPOINT ---
    try {
      if (!role) {
        throw new Error('Please select a role.');
      }
      
      const extraDetails = role === 'TEACHER' || role === 'HEADTEACHER' ? { school_code: schoolCode } : {};

      const updatedUser = await completeOnboarding(role, schoolCode, extraDetails);

      // Update the Auth context state
      updateUser(updatedUser); 

      // Redirect to the newly assigned dashboard
      navigate(`/dashboard/${updatedUser.role.toLowerCase()}`, { replace: true });
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const titleStyle = { 
    color: 'var(--color-secondary)', 
    textAlign: 'center', 
    marginBottom: '25px' 
  };
  
  return (
    <div className="card">
      <h2 style={titleStyle}>Welcome, {user?.first_name || user?.email}!</h2>
      <p style={{textAlign: 'center', marginBottom: '30px'}}>Please complete your profile setup.</p>
      <form onSubmit={handleOnboarding}>
        <div className="input-group">
          <label>Your Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="PARENT">Parent</option>
            <option value="TEACHER">Teacher</option>
            <option value="HEADTEACHER">Headteacher</option>
            <option value="OFFICER">County Officer</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        {(role === 'TEACHER' || role === 'HEADTEACHER') && (
          <div className="input-group">
            <label>School Code</label>
            <input 
              type="text" 
              value={schoolCode} 
              onChange={(e) => setSchoolCode(e.target.value)} 
              required 
              placeholder="Enter your school's unique code"
            />
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Finalizing...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingPage;
