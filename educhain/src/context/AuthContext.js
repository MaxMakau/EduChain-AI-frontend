import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, fetchUserProfile } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to check for token and fetch user on load
  const loadUser = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      try {
        const userData = await fetchUserProfile();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Token invalid or expired. Logging out.");
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);

      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Map API response to user object
      const userObj = {
        id: data.user_id,
        email: data.email,
        role: data.role,
        school: data.school,
        // add other fields if needed
      };

      setUser(userObj);
      setIsAuthenticated(true);

      return userObj;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed. Check credentials.';
      setError(errorMessage);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateUser = (newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    role: user?.role, // Easy access to the user's role
    needsOnboarding: isAuthenticated && !user?.role, // If authenticated but role is missing
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
