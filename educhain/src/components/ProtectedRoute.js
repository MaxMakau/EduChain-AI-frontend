import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, role, needsOnboarding } = useAuth();

  if (isLoading) {
    // Show a minimal loading spinner or message while checking auth status
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading session...</div>;
  }

  // 1. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. If authenticated but role is not set, redirect to onboarding
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. If a specific role is required, check it
  if (requiredRole && role !== requiredRole) {
    // You could redirect to a 403 page or the default dashboard
    return <Navigate to={`/dashboard/${role.toLowerCase()}`} replace />;
  }

  // 4. If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
