// components/SideBar/SideBar.js
import React, { useState } from 'react';
import ProjectNavigator from '../ProjectNavigator/ProjectNavigator';
import ProjectsPage from '../ProjectsPage/ProjectsPage';
import AssigneesPage from '../AssigneesPage/AssigneesPage';
import DashboardPage from '../DashboardPage/DashboardPage';
import './SideBar.css';

const SideBar = () => {
  const [activeTab, setActiveTab] = useState('Tasks');

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
      default:
        return <div className="content-panel">Select a tab</div>;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-tabs">
          {['Dashboard', 'Tasks', 'Projects', 'Assignees'].map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area (right side) */}
      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default SideBar;
