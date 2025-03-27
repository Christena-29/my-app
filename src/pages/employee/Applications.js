import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployeeApplications } from '../../services/api';
import '../../styles/Applications.css';

function EmployeeApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get employee information from localStorage
  const employeeId = localStorage.getItem('userId');
  const employeeName = localStorage.getItem('userName') || 'User';
  const userType = localStorage.getItem('userType');
  
  // Get employee's initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'User') return 'EM';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  useEffect(() => {
    // Check if user is logged in as an employee
    if (!employeeId || userType !== 'employee') {
      alert('Please log in as an employee to view your applications');
      navigate('/login');
      return;
    }
    
    // Fetch applications
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const applicationData = await getEmployeeApplications(employeeId);
        setApplications(Array.isArray(applicationData) ? applicationData : []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load your applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [employeeId, navigate, userType]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    navigate('/login');
  };
  
  // Get status label with proper formatting
  const getStatusLabel = (status) => {
    switch(status) {
      case 'waiting': return 'Pending Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="applications-container">
      <header className="applications-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          
          <div className="header-nav">
            <Link to="/employee/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/employee/applications" className="nav-link active">My Applications</Link>
            <Link to="/employee/profile" className="nav-link">Profile</Link>
            <Link to="/employee/nearby-jobs" className="nav-link nearby-jobs-link">
              <i className="location-pin-icon"></i> Nearby Jobs
            </Link>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">{getInitials(employeeName)}</div>
            <div className="user-menu-dropdown">
              <span>{employeeName}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="applications-main">
        <div className="page-title-container">
          <h1>My Applications</h1>
          <p>Track the status of your job applications</p>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No Applications Found</h2>
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/employee/dashboard" className="browse-jobs-btn">
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="applications-list-container">
            <div className="filter-bar">
              <div className="results-count">
                {applications.length} Application{applications.length !== 1 ? 's' : ''}
              </div>
              <div className="filter-controls">
                {/* Could add filtering by status here in the future */}
              </div>
            </div>
            
            <div className="applications-grid">
              {applications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="application-header">
                    <h3 className="job-title">{app.job_title}</h3>
                    <span className={`status-badge status-${app.status}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <p className="company-name">{app.company_name}</p>
                  <div className="application-meta">
                    <div className="meta-item">
                      <span className="meta-label">Applied:</span>
                      <span className="meta-value">{formatDate(app.applied_at)}</span>
                    </div>
                    {app.time_slot && (
                      <div className="meta-item">
                        <span className="meta-label">Time Slot:</span>
                        <span className="meta-value">{app.time_slot}</span>
                      </div>
                    )}
                  </div>
                  <div className="application-actions">
                    <Link 
                      to={`/employee/jobs/${app.job_id}`} 
                      className="view-job-btn"
                    >
                      View Job
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default EmployeeApplications;