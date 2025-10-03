import React, { useState, useEffect, useCallback } from 'react';
//import './Toast.css'; // We will define Toast.css next

// Use context or state management for global toast, but for this file,
// we'll use a simple state hook to manage the local toast state.

const Toast = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Function to close the toast
  const hideToast = useCallback(() => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 500); // Wait for transition to finish before calling onClose
    }
  }, [onClose]);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(hideToast, duration);
      return () => clearTimeout(timer); // Cleanup timer on unmount/new message
    }
  }, [message, duration, hideToast]);

  if (!message) return null;

  const toastStyle = {
    backgroundColor: type === 'error' ? '#D32F2F' : 'var(--color-secondary)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: `translateX(-50%) translateY(${isVisible ? '0' : '150%'})`,
    opacity: isVisible ? 1 : 0,
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    fontWeight: '600',
    minWidth: '250px',
    textAlign: 'center',
    cursor: 'pointer',
  };

  return (
    <div style={toastStyle} onClick={hideToast} role="alert" aria-live="assertive">
      {message}
    </div>
  );
};

export default Toast;
