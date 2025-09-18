import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { UserData } from './types/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in when app loads
    const checkAuthStatus = () => {
      const authData = localStorage.getItem('authData');
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error parsing auth data:', error);
          localStorage.removeItem('authData');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (user: UserData) => {
    // Store user data in localStorage
    localStorage.setItem('authData', JSON.stringify(user));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('authData');
    setIsLoggedIn(false);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#282c34',
        color: '#61dafb',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;
