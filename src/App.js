import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployerDashboard from './pages/employer/Dashboard';
import NearbyJobsMap from './pages/NearbyJobsMap';
import PostJob from './pages/employer/PostJob';
import JobDetails from './pages/employee/JobDetails';
import ApplicationReview from './pages/employer/ApplicationReview';
import EmployeeApplications from './pages/employee/Applications';
import EmployeeProfile from './pages/employee/Profile';
import EmployerProfile from './pages/employer/Profile';
import { testBackendConnection } from './services/api';

function App() {
  const [backendConnected, setBackendConnected] = useState(false);
  
  useEffect(() => {
    // Test backend connection when app loads
    const checkBackendConnection = async () => {
      const isConnected = await testBackendConnection();
      setBackendConnected(isConnected);
      
      if (!isConnected) {
        console.warn('Backend connection failed. Some features may not work.');
      }
    };
    
    checkBackendConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        {!backendConnected && (
          <div style={{
            background: '#fff3cd', 
            color: '#856404', 
            padding: '10px', 
            textAlign: 'center',
            borderBottom: '1px solid #ffeeba'
          }}>
            Backend connection failed. Some features may not be available.
          </div>
        )}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/jobs/:jobId" element={<JobDetails />} />
          <Route path="/employee/applications" element={<EmployeeApplications />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/nearby-jobs" element={<NearbyJobsMap />} />
          
          {/* Employer Routes */}
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/jobs/new" element={<PostJob />} />
          <Route path="/employer/applications/:applicationId" element={<ApplicationReview />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/nearby-talent" element={<Navigate to="/employer/dashboard" replace />} />
          
          {/* Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
