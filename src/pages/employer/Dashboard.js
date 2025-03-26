import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployerJobs, getEmployerApplications, getEmployerDetails } from '../../services/api';
import '../../styles/Dashboard.css';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employerData, setEmployerData] = useState(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    newApplications: 0
  });
  
  // Get employer information from localStorage
  const employerId = localStorage.getItem('userId');
  const employerName = localStorage.getItem('userName') || 'Employer';
  
  // Get employer's first initial and last initial for avatar
  const getInitials = (name) => {
    if (!name || name === 'Employer') return 'EM';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  useEffect(() => {
    // Check if user is logged in as an employer
    const userType = localStorage.getItem('userType');
    if (!employerId || userType !== 'employer') {
      alert('Please log in as an employer to view this page');
      navigate('/login');
      return;
    }
    
    // Fetch posted jobs and applications
    const fetchEmployerData = async () => {
      setLoading(true);
      
      try {
        // Fetch employer details including company name
        const employerDetails = await getEmployerDetails(employerId);
        if (employerDetails.status === 'success') {
          setEmployerData(employerDetails.employer);
          // Also update localStorage with the latest company name
          if (employerDetails.employer.company_name) {
            localStorage.setItem('companyName', employerDetails.employer.company_name);
          }
        }
        
        // Fetch jobs posted by the employer
        const jobsData = await getEmployerJobs(employerId);
        // Ensure we have an array
        const jobs = Array.isArray(jobsData) ? jobsData : [];
        setPostedJobs(jobs);
        
        // Fetch applications received by the employer
        const applicationData = await getEmployerApplications(employerId);
        // Ensure we have an array
        const applications = Array.isArray(applicationData) ? applicationData : [];
        setApplications(applications);
        
        // Calculate statistics
        const activeJobCount = jobs.filter(job => job.status === 'open').length;
        const totalApplicantsCount = applications.length;
        const newApplicationsCount = applications.filter(app => app.status === 'waiting').length;
        
        setStats({
          activeJobs: activeJobCount,
          totalApplicants: totalApplicantsCount,
          newApplications: newApplicationsCount
        });
      } catch (error) {
        console.error('Error fetching employer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployerData();
  }, [employerId, navigate]);
  
  // Get company name from either state or localStorage
  const companyName = employerData?.company_name || localStorage.getItem('companyName') || 'Company';
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('companyName');
    navigate('/login');
  };

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
            <Link to="/employer/nearby-talent" className="nav-link nearby-jobs-link">
              <i className="location-pin-icon"></i> Nearby Talent
            </Link>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">{getInitials(employerName)}</div>
            <div className="user-menu-dropdown">
              <span>{companyName}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <h1>Welcome back, {employerName}!</h1>
          <p>Manage your job listings and applications.</p>
          <div className="welcome-actions">
            <Link to="/employer/jobs/new" className="post-job-btn">+ Post New Job</Link>
            <Link to="/employer/nearby-talent" className="nearby-talent-button">
              <i className="map-marker-icon"></i> Find Nearby Talent
            </Link>
          </div>
        </section>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Active Jobs</h3>
            <p className="stat-number">{stats.activeJobs}</p>
          </div>
          <div className="stat-card">
            <h3>Total Applicants</h3>
            <p className="stat-number">{stats.totalApplicants}</p>
          </div>
          <div className="stat-card">
            <h3>New Applications</h3>
            <p className="stat-number">{stats.newApplications}</p>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Posted Jobs</h2>
            <Link to="/employer/jobs" className="view-all">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading your job listings...</p>
          ) : postedJobs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted any jobs yet.</p>
              <Link to="/employer/jobs/new" className="btn-primary">Post Your First Job</Link>
            </div>
          ) : (
            <div className="jobs-list">
              {postedJobs.slice(0, 3).map(job => (
                <div key={job.id} className="job-card">
                  <h3>{job.title}</h3>
                  <div className="job-details">
                    <span><i className="applicants-icon"></i> {job.application_count || 0} Applicants</span>
                    <span><i className="date-icon"></i> Posted: {formatDate(job.created_at)}</span>
                    <span className={`status status-${job.status.toLowerCase()}`}>
                      {job.status === 'open' ? 'Active' : job.status}
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
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any applications yet.</p>
              <p>Applications will appear here when people apply to your jobs.</p>
            </div>
          ) : (
            <div className="applications-list">
              {applications.slice(0, 3).map(app => (
                <div key={app.id} className="application-card">
                  <h3>{app.name}</h3>
                  <p>Applied for: {app.job_title}</p>
                  <div className="application-details">
                    <span>Applied: {formatDate(app.applied_at)}</span>
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