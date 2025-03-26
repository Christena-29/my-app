import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getJobById, applyForJob } from '../../services/api';
import '../../styles/JobDetails.css';

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  // Get employee information from localStorage
  const employeeId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  
  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return salary;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  useEffect(() => {
    // Check if user is logged in as an employee
    if (!employeeId || userType !== 'employee') {
      alert('Please log in as a job seeker to view job details and apply');
      navigate('/login');
      return;
    }
    
    // Fetch job details
    const fetchJobDetails = async () => {
      setLoading(true);
      try {
        const jobData = await getJobById(jobId);
        
        // Check if we got valid job data
        if (jobData && jobData.status === 'success' && jobData.job) {
          setJob(jobData.job);
        } else {
          setError('Job not found or has been removed.');
          console.warn('Invalid job data received:', jobData);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId, employeeId, navigate, userType]);
  
  const handleApply = async () => {
    setApplying(true);
    setError('');
    
    try {
      // Add empty cover letter as third parameter
      const response = await applyForJob(jobId, employeeId, '');
      
      if (response && response.status === 'success') {
        setApplicationSuccess(true);
      } else {
        setError(response?.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error applying for job:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-container loading">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      <header className="job-details-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          <div className="header-nav">
            <Link to="/employee/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/employee/applications" className="nav-link">My Applications</Link>
            <Link to="/employee/profile" className="nav-link">Profile</Link>
          </div>
          
          <div className="back-to-jobs">
            <Link to="/employee/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="job-details-main">
        {error ? (
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <Link to="/employee/dashboard" className="btn-primary">
              Return to Dashboard
            </Link>
          </div>
        ) : job && (
          <div className="job-details-card">
            <div className="job-header">
              <h1 className="job-title">{job.title}</h1>
              <div className="job-company">{job.company_name}</div>
              <div className="job-meta">
                <span className="job-date">Posted: {formatDate(job.created_at)}</span>
                <span className="job-type">{job.job_type || 'Not specified'}</span>
                <span className="job-salary">{formatSalary(job.salary)}</span>
              </div>
            </div>
            
            {applicationSuccess ? (
              <div className="application-success">
                <div className="success-icon">✓</div>
                <h2>Application Submitted!</h2>
                <p>Your application has been successfully submitted to {job.company_name}.</p>
                <p>You can track the status of your application in your dashboard.</p>
                <div className="success-actions">
                  <Link to="/employee/dashboard" className="btn-primary">
                    Return to Dashboard
                  </Link>
                  <Link to="/employee/applications" className="btn-secondary">
                    View My Applications
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="job-description">
                  <h2>Job Description</h2>
                  <div className="description-content">
                    {job.description}
                  </div>
                </div>
                
                {job.status === 'open' ? (
                  <div className="job-apply">
                    <button 
                      onClick={handleApply} 
                      className="apply-now-button"
                      disabled={applying}
                    >
                      {applying ? "Submitting Application..." : "Apply Now"}
                    </button>
                  </div>
                ) : (
                  <div className="job-closed">
                    <p>This position is no longer accepting applications.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default JobDetails;