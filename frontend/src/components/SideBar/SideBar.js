// components/SideBar/SideBar.js
import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import ProjectNavigator from '../ProjectNavigator/ProjectNavigator';
import ProjectsPage from '../ProjectsPage/ProjectsPage';
import AssigneesPage from '../AssigneesPage/AssigneesPage';
import DashboardPage from '../DashboardPage/DashboardPage';
import ProfilePage from '../ProfilePage/ProfilePage';
import BillingPage from '../BillingPage/BillingPage'; // Import BillingPage
import { useAuth } from '../../auth/AuthContext'; // Import useAuth
import './SideBar.css';

const SideBar = () => {
  const { user } = useAuth(); // Get user from auth context

  const trialEndsAt = user?.tenant?.trialEndsAt ? new Date(user.tenant.trialEndsAt) : null;
  const daysRemaining = trialEndsAt ? Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)) : null;

  // Define tabs with their routes and components
  const mainTabs = [
    { label: 'Dashboard', path: '/dashboard', element: <DashboardPage /> },
    { label: 'Tasks', path: '/tasks', element: <ProjectNavigator /> },
    { label: 'Projects', path: '/projects', element: <ProjectsPage /> },
    { label: 'Assignees', path: '/assignees', element: <AssigneesPage /> },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        {user?.tenant?.subscriptionStatus === 'trialing' && daysRemaining !== null && daysRemaining >= 0 && (
          <div className="trial-status">
            Trial ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
          </div>
        )}
        <nav className="main-nav" aria-label="Primary navigation">
          {mainTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
              // Only mark Dashboard active on exact match
              end={tab.path === '/dashboard'}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/billing"
            className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
            aria-label="View billing"
          >
            Billing
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `tab-button profile-tab ${isActive ? 'active' : ''}`}
            aria-label="View profile"
          >
            Profile
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area (right side) */}
      <main className="main-content" role="main">
        <Routes>
          {/* Default to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main tab routes */}
          {mainTabs.map((tab) => (
            <Route key={tab.path} path={tab.path} element={tab.element} />
          ))}

          {/* Profile route */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/billing" element={<BillingPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default SideBar;
