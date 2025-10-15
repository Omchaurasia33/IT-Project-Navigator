// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar/SideBar';
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import AuthCallback from './components/Auth/AuthCallback';
import GoogleSignupPage from './components/Auth/GoogleSignupPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup-google" element={<GoogleSignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes render the main app with sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<SideBar />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;