import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../lib/api';

const AuthCallback = () => {
  const { setToken, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token found.');
        }

        // Save token to localStorage and context
        localStorage.setItem('token', token);
        setToken(token);

        // Fetch user data
        const res = await apiFetch('/auth/me');

        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`Server responded with status ${res.status}: ${errorData}`);
        }

        const data = await res.json();
        setUser(data.user);

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('AuthCallback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/login', { replace: true }), 5000);
      }
    };

    handleAuth();
  }, [location, setToken, setUser, navigate]);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <p>Authentication failed:</p>
        <p>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default AuthCallback;
