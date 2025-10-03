import axios from 'axios';

// Ensure you have a .env file with: REACT_APP_API_URL=https://educhain-ai.onrender.com/api
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'; 

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Access Token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from local storage or context (localStorage is simplest for prototyping)
    const accessToken = localStorage.getItem('access_token'); 
    
    if (accessToken) {
      // The API uses JWT Auth, which requires 'Bearer' prefix
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Optional handling for 401/403 errors (e.g., token expired)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Authentication expired or failed. Redirecting to login.");
            // Optional: You could trigger an automatic logout here
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('refresh_token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
