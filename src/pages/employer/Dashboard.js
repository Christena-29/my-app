import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Dashboard.css';

function EmployerDashboard() {
  const [postedJobs, setPostedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setPostedJobs([
        { id: 1, title: 'Frontend Developer', applicants: 12, status: 'Active', postedDate: '2025-03-01' },
        { id: 2, title: 'UX Designer', applicants: 8, status: 'Active', postedDate: '2025-02-25' },
        { id: 3, title: 'Project Manager', applicants: 5, status: 'Active', postedDate: '2025-03-10' },
      ]);
      
      setApplications([
        { id: 1, name: 'Sarah Johnson', position: 'Frontend Developer', appliedDate: '2025-03-15', status: 'New' },
        { id: 2, name: 'Michael Chen', position: 'UX Designer', appliedDate: '2025-03-10', status: 'In Review' },
        { id: 3, name: 'Emily Davis', position: 'Frontend Developer', appliedDate: '2025-03-12', status: 'New' },
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
            <Link to="/employer/jobs" className="nav-link">My Jobs</Link>
            <Link to="/employer/applications" className="nav-link">Applications</Link>
            <Link to="/employer/profile" className="nav-link">Company Profile</Link>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">TC</div>
            <div className="user-menu-dropdown">
              <span>Tech Company</span>
              <Link to="/logout" className="logout-btn">Logout</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <h1>Welcome back, Tech Company!</h1>
          <p>Manage your job listings and applications.</p>
          <Link to="/employer/jobs/new" className="post-job-btn">+ Post New Job</Link>
        </section>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Jobs</h3>
            <p className="stat-number">3</p>
          </div>
          <div className="stat-card">
            <h3>Total Applicants</h3>
            <p className="stat-number">25</p>
          </div>
          <div className="stat-card">
            <h3>New Applications</h3>
            <p className="stat-number">8</p>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Posted Jobs</h2>
            <Link to="/employer/jobs" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading your job listings...</p>
          ) : (
            <div className="jobs-list">
              {postedJobs.map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <div className="job-details">
                    <span><i className="applicants-icon"></i> {job.applicants} Applicants</span>
                    <span><i className="date-icon"></i> Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                    <span className={`status status-${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-actions">
                    <Link to={`/employer/jobs/${job.id}`} className="view-job-btn">
                      View Details
                    </Link>
                    <button className="edit-job-btn">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
            <Link to="/employer/applications" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading recent applications...</p>
          ) : (
            <div className="applications-list">
              {applications.map(app => (
                <div key={app.id} className="application-card">
                  <h3>{app.name}</h3>
                  <p>Applied for: {app.position}</p>
                  <div className="application-details">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <span className={`status status-${app.status.toLowerCase().replace(' ', '-')}`}>
                      {app.status}
                    </span>
                  </div>
                  <Link to={`/employer/applications/${app.id}`} className="view-application-btn">
                    Review Application
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

export default EmployerDashboard;