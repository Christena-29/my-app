import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllJobs, getEmployeeApplications } from '../../services/api';
import '../../styles/Dashboard.css';

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    waitingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  
  // Get employee information from localStorage
  const employeeId = localStorage.getItem('userId');
  const employeeName = localStorage.getItem('userName') || 'User';
  
  // Get employee's first initial and last initial for avatar
  const getInitials = (name) => {
    if (!name || name === 'User') return 'EM';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  useEffect(() => {
    // Check if user is logged in as an employee
    const userType = localStorage.getItem('userType');
    if (!employeeId || userType !== 'employee') {
      alert('Please log in as an employee to view this page');
      navigate('/login');
      return;
    }
    
    // Fetch applications
    const fetchApplications = async () => {
      setLoading(true);
      
      try {
        // Fetch applications submitted by the employee
        const applicationData = await getEmployeeApplications(employeeId);
        setApplications(applicationData);
        
        // Calculate statistics
        const totalApps = applicationData.length;
        const waitingApps = applicationData.filter(app => app.status === 'waiting').length;
        const acceptedApps = applicationData.filter(app => app.status === 'accepted').length;
        const rejectedApps = applicationData.filter(app => app.status === 'rejected').length;
        
        setStats({
          totalApplications: totalApps,
          waitingApplications: waitingApps,
          acceptedApplications: acceptedApps,
          rejectedApplications: rejectedApps
        });
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch all available jobs separately
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const jobsData = await getAllJobs();
        console.log("Jobs received in dashboard:", jobsData); // Add for debugging
        
        // Make sure we're setting an array even if the API returned something unexpected
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };
    
    fetchApplications();
    fetchJobs();
  }, [employeeId, navigate]);
  
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

  // Get the first name from the full name
  const firstName = employeeName.split(' ')[0];
  
  // Check if user has already applied to a job
  const hasApplied = (jobId) => {
    return Array.isArray(applications) && applications.some(app => app.job_id === jobId);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          
          <div className="header-nav">
            <Link to="/employee/jobs" className="nav-link">Find Jobs</Link>
            <Link to="/employee/applications" className="nav-link">My Applications</Link>
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

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <h1>Welcome back, {firstName}!</h1>
          <p>Here's what's happening with your job search.</p>
          <div className="welcome-actions">
            <Link to="/employee/nearby-jobs" className="nearby-jobs-button">
              <i className="map-marker-icon"></i> Find Nearby Jobs
            </Link>
          </div>
        </section>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Applications</h3>
            <p className="stat-number">{stats.totalApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number">{stats.waitingApplications}</p>
          </div>
          <div className="stat-card">
            <h3>Accepted</h3>
            <p className="stat-number">{stats.acceptedApplications}</p>
          </div>
        </div>

        {/* Your Applications Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Applications</h2>
            <Link to="/employee/applications" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading your applications...</p>
          ) : Array.isArray(applications) && applications.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied to any jobs yet.</p>
              <p>Browse available jobs below and apply today!</p>
            </div>
          ) : (
            <div className="applications-list">
              {Array.isArray(applications) && applications.slice(0, 3).map(app => (
                <div key={app.id} className="application-card">
                  <h3>{app.job_title}</h3>
                  <p>{app.company_name}</p>
                  <div className="application-details">
                    <span>Applied: {formatDate(app.applied_at)}</span>
                    <span className={`status status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Available Jobs Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Available Jobs</h2>
          </div>
          
          {jobsLoading ? (
            <div className="loading-indicator">
              <p>Finding jobs for you...</p>
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="empty-state">
              <p>No job listings available at the moment.</p>
              <p>Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="jobs-list full-width">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p className="company-name">{job.company_name || 'Company'}</p>
                  <div className="job-details">
                    <span><i className="job-type-icon"></i> {job.job_type || 'Not specified'}</span>
                    <span><i className="salary-icon"></i> {job.salary || 'Not specified'}</span>
                    <span><i className="date-icon"></i> Posted: {formatDate(job.created_at)}</span>
                  </div>
                  <div className="job-description-preview">
                    {job.description && job.description.length > 150 
                      ? `${job.description.substring(0, 150)}...` 
                      : job.description || 'No description provided'}
                  </div>
                  <div className="job-actions">
                    <Link to={`/employee/jobs/${job.id}`} className="view-job-btn">
                      View Details
                    </Link>
                    {hasApplied(job.id) ? (
                      <span className="already-applied">Applied</span>
                    ) : (
                      <Link to={`/employee/jobs/${job.id}`} className="apply-now-btn">
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default EmployeeDashboard;