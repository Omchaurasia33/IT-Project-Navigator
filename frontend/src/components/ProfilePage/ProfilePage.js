// components/ProfilePage/ProfilePage.js
import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  // In a real app, fetch this from user context, Redux, or API
  const [user] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Project Manager',
    avatar: 'https://via.placeholder.com/100?text=AJ', // Replace with real avatar URL
  });

  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleLogout = () => {
    // In a real app, integrate with auth context or API
    if (window.confirm('Are you sure you want to log out?')) {
      console.log('Logging out...');
      // e.g., redirect to login page
    }
  };

  const handleLinkClick = (action) => {
    // In a real app, use React Router or modals for navigation
    console.log(`Navigating to: ${action}`);
    // e.g., set modal state or history.push(`/settings/${action.toLowerCase().replace(' ', '-')}`)
  };

  return (
    <main className="profile-page" role="main" aria-labelledby="profile-title">
      <section className="profile-header" aria-labelledby="profile-name">
        <div className="avatar-container">
          <img
            src={user.avatar}
            alt={`${user.name}'s profile avatar`}
            className="profile-avatar"
            onError={handleAvatarError}
          />
          {avatarError && (
            <div className="avatar-fallback">
              <span className="avatar-initials">{user.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
          )}
        </div>
        <h1 id="profile-name" className="profile-name">{user.name}</h1>
        <p className="profile-email" aria-label="Email address">{user.email}</p>
        <span className="profile-role" role="img" aria-label={`Role: ${user.role}`}>
          {user.role}
        </span>
      </section>

      <section className="profile-section" aria-labelledby="account-settings">
        <h2 id="account-settings">Account Settings</h2>
        <nav className="profile-links" role="navigation" aria-label="Account settings navigation">
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Update Profile')}
            aria-label="Update profile information"
          >
            Update Profile
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Change Password')}
            aria-label="Change password"
          >
            Change Password
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Notification Preferences')}
            aria-label="Manage notification preferences"
          >
            Notification Preferences
          </button>
          <button
            className="profile-link"
            onClick={() => handleLinkClick('Privacy Settings')}
            aria-label="Adjust privacy settings"
          >
            Privacy Settings
          </button>
        </nav>
      </section>

      <section className="profile-section" aria-labelledby="activity">
        <h2 id="activity">Recent Activity</h2>
        <dl className="activity-list">
          <div className="activity-item">
            <dt>Last login:</dt>
            <dd>Today at 9:45 AM</dd>
          </div>
          <div className="activity-item">
            <dt>Projects assigned:</dt>
            <dd>5</dd>
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