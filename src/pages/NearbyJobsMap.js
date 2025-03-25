import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/NearbyJobsMap.css';

function NearbyJobsMap() {
  const [jobs, setJobs] = useState([]);
  const location = useLocation();

  // Determine if user is employee or employer based on route
  const userType = location.pathname.includes('/employee') ? 'employee' : 'employer';

  // Get user location and fetch jobs
  useEffect(() => {
    // Simulate getting user location
    console.log('Getting user location...');
    
    // Mock job data with fixed positions for demonstration
    setTimeout(() => {
      const mockJobs = [
        {
          id: 1,
          title: 'Frontend Developer',
          company: 'Tech Solutions Inc.',
          position: { left: '30%', top: '40%' }
        },
        {
          id: 2,
          title: 'UX Designer',
          company: 'Creative Agency',
          position: { left: '45%', top: '25%' }
        },
        {
          id: 3,
          title: 'Backend Developer',
          company: 'Data Solutions',
          position: { left: '70%', top: '55%' }
        },
        {
          id: 4,
          title: 'Product Manager',
          company: 'Startup Inc.',
          position: { left: '60%', top: '35%' }
        },
        {
          id: 5,
          title: 'DevOps Engineer',
          company: 'Cloud Systems',
          position: { left: '25%', top: '60%' }
        }
      ];
      
      setJobs(mockJobs);
    }, 1000);
  }, []);

  // Determine page title based on user type
  const pageTitle = userType === 'employee' ? 'Nearby Job Locations' : 'Available Talent Locations';

  return (
    <div className="simple-map-page">
      <header className="map-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" className="logo-small" />
          </Link>
          
          <h1>{pageTitle}</h1>
          
          <Link to={`/${userType}/dashboard`} className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="map-container">
        <div className="simple-map">
          {/* User marker */}
          <div className="user-marker" title="Your Location">
            <span>You</span>
          </div>
          
          {/* Job markers with fixed positions */}
          {jobs.map(job => (
            <div 
              key={job.id}
              className="job-marker"
              style={{ left: job.position.left, top: job.position.top }}
              title={`${job.title} at ${job.company}`}
            >
              <span>{job.id}</span>
            </div>
          ))}
          
          {/* Coordinates overlay */}
          <div className="coordinates-grid">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="grid-line horizontal" style={{ top: `${i * 10}%` }}></div>
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="grid-line vertical" style={{ left: `${i * 10}%` }}></div>
            ))}
          </div>
        </div>
        
        <div className="location-list">
          <h2>Available Locations</h2>
          <div className="job-locations-list">
            {jobs.map(job => (
              <div key={job.id} className="location-item">
                <div className="location-marker">{job.id}</div>
                <div className="location-details">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <p className="coordinates">
                    Coords: x={job.position.left}, y={job.position.top}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NearbyJobsMap;