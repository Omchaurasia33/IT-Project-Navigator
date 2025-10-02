// components/SideBar/SideBar.js
import React, { useState } from 'react';
import ProjectNavigator from '../ProjectNavigator/ProjectNavigator';
import ProjectsPage from '../ProjectsPage/ProjectsPage';
import AssigneesPage from '../AssigneesPage/AssigneesPage';
import DashboardPage from '../DashboardPage/DashboardPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import './SideBar.css';

const SideBar = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Tasks':
        return <ProjectNavigator />;
      case 'Projects':
        return <ProjectsPage />;
      case 'Assignees':
        return <AssigneesPage />;
      case 'Profile':
        return <ProfilePage />;
      default:
        return <div className="content-panel">Select a tab</div>;
    }
  };

  const mainTabs = ['Dashboard', 'Tasks', 'Projects', 'Assignees'];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        <nav className="main-nav" aria-label="Primary navigation">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className={`tab-button profile-tab ${activeTab === 'Profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('Profile')}
            aria-label="View profile"
          >
            Profile
          </button>
        </div>
      </aside>

      {/* Main Content Area (right side) */}
      <main className="main-content" role="main">{renderContent()}</main>
    </div>
  );
};

export default SideBar;