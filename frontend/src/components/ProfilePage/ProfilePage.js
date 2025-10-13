// components/ProfilePage/ProfilePage.js
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from localStorage
    const fetchUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // if you have auth token
      
      console.log('Logging out...');
      
      // Redirect to login page
      window.location.href = '/login'; // or use React Router: navigate('/login')
    }
  };

  const handleLinkClick = (action) => {
    console.log(`Navigating to: ${action}`);
    // Implement navigation using React Router
    // navigate(`/settings/${action.toLowerCase().replace(/ /g, '-')}`);
  };

  // Show loading state
  if (loading) {
    return (
      <main className="profile-page" role="main">
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  // Show error if no user data
  if (!user) {
    return (
      <main className="profile-page" role="main">
        <div className="error-container">
          <p>No user data found. Please log in again.</p>
          <button onClick={() => window.location.href = '/login'}>
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page" role="main" aria-labelledby="profile-title">
      <section className="profile-header" aria-labelledby="profile-name">
        <div className="avatar-container">
          <div className="avatar-fallback">
            <span className="avatar-initials">{getInitials(user.name)}</span>
          </div>
        </div>
        <h1 id="profile-name" className="profile-name">{user.name}</h1>
        <p className="profile-email" aria-label="Email address">{user.email}</p>
        <span className="profile-role" aria-label={`Role: ${formatRole(user.role)}`}>
          {formatRole(user.role)}
        </span>
        {user.tenant && (
          <span className="profile-tenant" aria-label={`Organization: ${user.tenant}`}>
            Organization: {user.tenant}
          </span>
        )}
      </section>

      <section className="profile-section" aria-labelledby="account-settings">
        <h2 id="account-settings">Account Settings</h2>
        <nav className="profile-links" role="navigation" aria-label="Account settings navigation">
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Update Profile')}
            aria-label="Update profile information"
          >
            <span className="link-icon">👤</span>
            Update Profile
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Change Password')}
            aria-label="Change password"
          >
            <span className="link-icon">🔒</span>
            Change Password
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Notification Preferences')}
            aria-label="Manage notification preferences"
          >
            <span className="link-icon">🔔</span>
            Notification Preferences
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Privacy Settings')}
            aria-label="Adjust privacy settings"
          >
            <span className="link-icon">🛡️</span>
            Privacy Settings
          </button>
        </nav>
      </section>

      <section className="profile-section" aria-labelledby="account-info">
        <h2 id="account-info">Account Information</h2>
        <dl className="info-list">
          <div className="info-item">
            <dt>User ID:</dt>
            <dd>{user.id}</dd>
          </div>
          <div className="info-item">
            <dt>Email:</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="info-item">
            <dt>Role:</dt>
            <dd>{formatRole(user.role)}</dd>
          </div>
          {user.tenant && (
            <div className="info-item">
              <dt>Organization:</dt>
              <dd>{user.tenant}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="profile-section" aria-labelledby="activity">
        <h2 id="activity">Recent Activity</h2>
        <dl className="activity-list">
          <div className="activity-item">
            <dt>Last login:</dt>
            <dd>{new Date().toLocaleString()}</dd>
          </div>
          <div className="activity-item">
            <dt>Account status:</dt>
            <dd className="status-active">Active</dd>
          </div>
        </dl>
      </section>

      <footer className="profile-footer">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </footer>
    </main>
  );
};

export default ProfilePage;