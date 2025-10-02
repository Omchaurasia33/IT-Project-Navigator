// components/ProfilePage/ProfilePage.js
import React from 'react';
import './ProfilePage.css'; // Optional: add styling later

const ProfilePage = () => {
  // You can later connect this to user context or API
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Project Manager',
    avatar: 'https://via.placeholder.com/100?text=AJ', // Replace with real avatar URL
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.avatar} alt="Profile" className="profile-avatar" />
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        <span className="profile-role">{user.role}</span>
      </div>

      <div className="profile-section">
        <h3>Account Settings</h3>
        <ul className="profile-links">
          <li>Update Profile</li>
          <li>Change Password</li>
          <li>Notification Preferences</li>
          <li>Privacy Settings</li>
        </ul>
      </div>

      <div className="profile-section">
        <h3>Activity</h3>
        <p>Last login: Today at 9:45 AM</p>
        <p>Projects assigned: 5</p>
      </div>

      {/* Optional: Logout button */}
      {/* <button className="logout-button">Log Out</button> */}
    </div>
  );
};

export default ProfilePage;