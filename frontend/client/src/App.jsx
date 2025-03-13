import './css/App.css';
import React from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Auth from './pages/AuthPage';
import Account from './pages/AccountPage';
import AllReleases from './pages/AllReleasesPage';
import Release from './pages/ReleasePage';
import User from './pages/UserPage';
import ReviewDashboard from './pages/ReviewDashboardPage';
import Reports from './pages/ReportsPage';
import HomePage from './pages/HomePage'; // Import the new HomePage component
import Navbar from './components/Navbar';
import { useSession } from './context/SessionProvider';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const session = useSession();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

function App() {
  const session = useSession();
  
  return (
    <Router>
      {session && <Navbar />} {/* Only show navbar when logged in */}
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" replace />} />
        <Route path="/" element={<HomePage />} /> {/* New homepage route */}
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ReviewDashboard />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/all-releases" element={
          <ProtectedRoute>
            <AllReleases />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/release/:id_int" element={
          <ProtectedRoute>
            <Release />
          </ProtectedRoute>
        } />
        <Route path="/user/:userName" element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;