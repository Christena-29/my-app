import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createJob } from '../../services/api';
import '../../styles/PostJob.css';

function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    time_slot: '', // Time slot is now a primary field
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Retrieve employer ID from localStorage
  const employer_id = localStorage.getItem('userId');

  useEffect(() => {
    // Redirect if not logged in as employer
    if (!localStorage.getItem('token') || localStorage.getItem('userType') !== 'employer') {
      alert('You must be logged in as an employer to post jobs.');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your location. Please enter coordinates manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      setError("Job title is required");
      return;
    }
    if (!formData.description) {
      setError("Job description is required");
      return;
    }
    if (!formData.time_slot) {
      setError("Time slot is required for part-time jobs");
      return;
    }

    setLoading(true);
    setError('');
    
    // Prepare data for API - always set job_type as Part-time
    const jobData = {
      employer_id: parseInt(employer_id),
      title: formData.title,
      description: formData.description,
      salary: formData.salary || null,
      job_type: 'Part-time', // Always set to Part-time
      time_slot: formData.time_slot // Include time slot
    };

    // Add location if provided
    if (formData.latitude && formData.longitude) {
      jobData.latitude = parseFloat(formData.latitude);
      jobData.longitude = parseFloat(formData.longitude);
    }

    try {
      const response = await createJob(jobData);
      
      if (response.status === 'success') {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          salary: '',
          time_slot: '', // Reset time slot field
          latitude: '',
          longitude: ''
        });
        
        // Alert the user
        alert('Job posted successfully!');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/employer/dashboard');
        }, 1500);
      } else {
        setError(response.message || 'Failed to post job. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <header className="post-job-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          <h1>Post a New Job</h1>
          <div className="navigation-links">
            <Link to="/employer/dashboard" className="back-link">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="post-job-main">
        <div className="post-job-card">
          {success ? (
            <div className="success-message">
              <h2>Job Posted Successfully!</h2>
              <p>Your job has been posted and is now visible to potential applicants.</p>
              <Link to="/employer/dashboard" className="btn-primary">
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="post-job-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-section">
                <h2>Job Details</h2>
                
                <div className="form-group">
                  <label htmlFor="title">Job Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time_slot">Time Slot</label>
                  <select
                    id="time_slot"
                    name="time_slot"
                    value={formData.time_slot}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Time Slot</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Weekend">Weekend</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="salary">Salary/Compensation</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $75,000 - $95,000 per year"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Job Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the job responsibilities, requirements, benefits, etc."
                    rows="8"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="form-section">
                <h2>Job Location (Optional)</h2>
                <p className="form-info">
                  Adding location helps candidates find your job in location-based searches.
                </p>
                
                <div className="form-group location-btn-container">
                  <button
                    type="button"
                    className="get-location-btn"
                    onClick={getLocation}
                    disabled={loading}
                  >
                    {loading ? "Getting Location..." : "Use Current Location"}
                  </button>
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 37.7749"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="e.g. -122.4194"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="post-job-button"
                  disabled={loading}
                >
                  {loading ? "Posting Job..." : "Post Job"}
                </button>
                
                <Link to="/employer/dashboard" className="cancel-button">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default PostJob;