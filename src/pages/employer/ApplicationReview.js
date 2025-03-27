import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getApplicationDetails, updateApplicationStatus } from '../../services/api';
import '../../styles/ApplicationReview.css';

function ApplicationReview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Get employer information from localStorage
  const employerId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  
  useEffect(() => {
    // Check if user is logged in as an employer
    if (!employerId || userType !== 'employer') {
      alert('Please log in as an employer to review applications');
      navigate('/login');
      return;
    }
    
    // Fetch application details
    const fetchApplicationDetails = async () => {
      setLoading(true);
      try {
        const response = await getApplicationDetails(applicationId);
        if (response && response.status === 'success') {
          setApplication(response.application);
        } else {
          setError('Application not found or has been removed.');
        }
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationDetails();
  }, [applicationId, employerId, navigate, userType]);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleStatusChange = async (status) => {
    setUpdating(true);
    setError('');
    setNewStatus(status);
    
    try {
      const response = await updateApplicationStatus(applicationId, status);
      
      if (response && response.status === 'success') {
        setStatusUpdateSuccess(true);
        // Update local state
        setApplication({
          ...application,
          status: status
        });
      } else {
        setError(response?.message || 'Failed to update application status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'waiting': return 'Pending Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="application-review-container loading">
        <div className="loading-spinner"></div>
        <p>Loading application details...</p>
      </div>
    );
  }

  return (
    <div className="application-review-container">
      <header className="application-review-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          <h1>Application Review</h1>
          <div className="navigation-links">
            <Link to="/employer/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="application-review-main">
        {error ? (
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <Link to="/employer/dashboard" className="btn-primary">
              Return to Dashboard
            </Link>
          </div>
        ) : application && (
          <div className="application-review-card">
            <div className="application-header">
              <div className="application-meta">
                <span className="application-date">Applied: {formatDate(application.applied_at)}</span>
                <span className={`application-status status-${application.status}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
              <h1 className="job-title">{application.job_title}</h1>
              <p className="company-name">{application.company_name}</p>
            </div>
            
            <div className="applicant-info">
              <h2>Applicant Information</h2>
              <div className="info-row">
                <span className="label">Name:</span>
                <span className="value">{application.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{application.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Education:</span>
                <span className="value">{application.education}</span>
              </div>
              <div className="info-row">
                <span className="label">Experience:</span>
                <span className="value">{application.experience} years</span>
              </div>
              
              {Array.isArray(application.skills) && application.skills.length > 0 && (
                <div className="skills-section">
                  <h3>Skills</h3>
                  <div className="skills-list">
                    {application.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {application.cover_letter && (
              <div className="cover-letter-section">
                <h2>Cover Letter</h2>
                <div className="cover-letter-content">
                  {application.cover_letter}
                </div>
              </div>
            )}
            
            <div className="job-description-section">
              <h2>Job Description</h2>
              <div className="job-description-content">
                {application.job_description}
              </div>
            </div>
            
            <div className="action-section">
              <h2>Update Application Status</h2>
              
              {statusUpdateSuccess && (
                <div className="success-message">
                  Application status updated to <strong>{getStatusLabel(newStatus)}</strong>
                </div>
              )}
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="status-buttons">
                <button 
                  onClick={() => handleStatusChange('accepted')} 
                  className="accept-button"
                  disabled={updating || application.status === 'accepted' || application.status === 'rejected'}
                  title={application.status === 'rejected' ? "Cannot change status after rejection" : ""}
                >
                  {updating && newStatus === 'accepted' ? "Processing..." : "Accept Application"}
                </button>
                <button 
                  onClick={() => handleStatusChange('rejected')} 
                  className="reject-button"
                  disabled={updating || application.status === 'rejected' || application.status === 'accepted'}
                  title={application.status === 'accepted' ? "Cannot change status after acceptance" : ""}
                >
                  {updating && newStatus === 'rejected' ? "Processing..." : "Reject Application"}
                </button>
                <button 
                  onClick={() => handleStatusChange('waiting')} 
                  className="reset-button"
                  disabled={updating || application.status === 'waiting' || 
                            application.status === 'accepted' || application.status === 'rejected'}
                  title={application.status === 'accepted' || application.status === 'rejected' ? 
                        "Cannot change status after final decision" : ""}
                >
                  {updating && newStatus === 'waiting' ? "Processing..." : "Mark as Pending"}
                </button>
              </div>
              
              {(application.status === 'accepted' || application.status === 'rejected') && (
                <div className="status-locked-message">
                  <i className="info-icon"></i>
                  <span>This application status has been finalized and cannot be changed.</span>
                </div>
              )}
            </div>
            
            <div className="navigation-footer">
              <Link to="/employer/applications" className="btn-secondary">
                View All Applications
              </Link>
              <Link to="/employer/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ApplicationReview;