import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

function EmployeeDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setJobs([
        { id: 1, title: 'Frontend Developer', company: 'Tech Solutions', location: 'New York', salary: '$90,000' },
        { id: 2, title: 'UX Designer', company: 'Creative Agency', location: 'San Francisco', salary: '$85,000' },
        { id: 3, title: 'Project Manager', company: 'Global Innovations', location: 'Chicago', salary: '$95,000' },
      ]);
      
      setApplications([
        { id: 1, jobTitle: 'Web Developer', company: 'Digital Solutions', appliedDate: '2025-03-01', status: 'Waiting' },
        { id: 2, jobTitle: 'UI Designer', company: 'Design Studios', appliedDate: '2025-02-25', status: 'Accepted' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

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
            <div className="user-avatar">JS</div>
            <div className="user-menu-dropdown">
              <span>John Smith</span>
              <Link to="/logout" className="logout-btn">Logout</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <h1>Welcome back, John!</h1>
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
            <p className="stat-number">2</p>
          </div>
          <div className="stat-card">
            <h3>Interviews</h3>
            <p className="stat-number">1</p>
          </div>
          <div className="stat-card">
            <h3>Saved Jobs</h3>
            <p className="stat-number">5</p>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Your Applications</h2>
            <Link to="/employee/applications" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading your applications...</p>
          ) : (
            <div className="applications-list">
              {applications.map(app => (
                <div key={app.id} className="application-card">
                  <h3>{app.jobTitle}</h3>
                  <p>{app.company}</p>
                  <div className="application-details">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span className={`status status-${app.status.toLowerCase()}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Jobs</h2>
            <Link to="/employee/jobs" className="view-all">Browse All</Link>
          </div>
          
          {loading ? (
            <p>Finding jobs for you...</p>
          ) : (
            <div className="jobs-list">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <div className="job-details">
                    <span><i className="location-icon"></i> {job.location}</span>
                    <span><i className="salary-icon"></i> {job.salary}</span>
                  </div>
                  <Link to={`/employee/jobs/${job.id}`} className="view-job-btn">
                    View Details
                  </Link>
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