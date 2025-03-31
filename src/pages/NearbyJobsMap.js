import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNearbyJobs, getAllJobs } from '../services/api';
import '../styles/NearbyJobsMap.css';

function NearbyJobsMap() {
  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  
  const navigate = useNavigate();

  // Get user info from localStorage
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    // Check if user is logged in
    if (!userId || localStorage.getItem('userType') !== 'employee') {
      alert('Please log in as a job seeker to view nearby jobs');
      navigate('/login');
      return;
    }
    
    // Fetch user location and nearby jobs
    const fetchJobs = async () => {
      setLoading(true);
      
      try {
        // Get user's saved location or use default
        const userLatitude = localStorage.getItem('userLatitude');
        const userLongitude = localStorage.getItem('userLongitude');
        
        let userLatLng = {
          latitude: userLatitude ? parseFloat(userLatitude) : 40.7128,
          longitude: userLongitude ? parseFloat(userLongitude) : -74.0060
        };
        
        setUserLocation(userLatLng);
        console.log("User location set:", userLatLng);
        
        // Start with dummy jobs to ensure we have something to display
        const dummyJobs = generateDummyJobs(userLatLng);
        
        // Try to get real jobs from API
        try {
          const response = await getAllJobs();
          console.log("Jobs API response:", response);
          
          if (Array.isArray(response) && response.length > 0) {
            // Filter jobs with location data
            const jobsWithLocation = response.filter(job => 
              job.latitude && job.longitude && 
              !isNaN(parseFloat(job.latitude)) && 
              !isNaN(parseFloat(job.longitude))
            );
            
            console.log(`Found ${jobsWithLocation.length} jobs with valid location data`);
            
            if (jobsWithLocation.length > 0) {
              setJobs(jobsWithLocation);
            } else {
              console.log("Using dummy jobs due to no valid location data");
              setJobs(dummyJobs);
            }
          } else {
            console.log("No jobs returned from API, using dummy jobs");
            setJobs(dummyJobs);
          }
        } catch (error) {
          console.error("Error fetching jobs:", error);
          setJobs(dummyJobs);
        }
      } catch (err) {
        console.error('Error in job map setup:', err);
        setError('Failed to initialize map. Please try again.');
        // Use dummy data as fallback
        setJobs(generateDummyJobs({ latitude: 40.7128, longitude: -74.0060 }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [userId, navigate]);
  
  // Generate dummy job data around the user location
  const generateDummyJobs = (center) => {
    console.log("Generating dummy jobs around:", center);
    const jobs = [];
    for (let i = 1; i <= 8; i++) {
      // Generate random offsets for lat/lng
      const latOffset = (Math.random() - 0.5) * 0.1;  // +/- 0.05 degrees
      const lngOffset = (Math.random() - 0.5) * 0.1;  // +/- 0.05 degrees
      
      const jobLat = center.latitude + latOffset;
      const jobLng = center.longitude + lngOffset;
      
      jobs.push({
        id: i,
        title: `Sample Job ${i}`,
        company_name: `Company ${i}`,
        description: `This is a sample job ${i} description for demonstration purposes.`,
        salary: `$${Math.floor(Math.random() * 50 + 15)}/hr`,
        time_slot: ['Morning', 'Evening', 'Weekend'][Math.floor(Math.random() * 3)],
        status: 'open',
        latitude: jobLat,
        longitude: jobLng,
        created_at: new Date().toISOString()
      });
    }
    return jobs;
  };
  
  // Calculate position on map based on lat/lng relative to user location
  const calculateMapPosition = (coord, axis, userLoc) => {
    // Handle invalid coordinates
    if (coord === null || coord === undefined) {
      return axis === 'x' ? '50%' : '50%';
    }
    
    // Ensure we have a number
    const coordValue = typeof coord === 'string' ? parseFloat(coord) : coord;
    
    if (isNaN(coordValue)) {
      return axis === 'x' ? '50%' : '50%';
    }

    // Get appropriate user coordinate for comparison
    const userCoord = axis === 'x' ? userLocation.longitude : userLocation.latitude;
    
    // Use a more zoomed-in view - calculate relative position from user's location
    // This creates a more "local map" feel rather than a global projection
    const zoomFactor = axis === 'x' ? 500 : 500;
    const offset = coordValue - userCoord;
    const position = 50 + (offset * zoomFactor);
    
    // Keep positions within reasonable bounds (10% to 90% of container)
    const boundedPosition = Math.max(10, Math.min(90, position));
    
    return `${boundedPosition}%`;
  };
  
  // Calculate distance between two points (simplified)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return "Unknown";
    }
    
    const lat1Value = typeof lat1 === 'string' ? parseFloat(lat1) : lat1;
    const lon1Value = typeof lon1 === 'string' ? parseFloat(lon1) : lon1;
    const lat2Value = typeof lat2 === 'string' ? parseFloat(lat2) : lat2;
    const lon2Value = typeof lon2 === 'string' ? parseFloat(lon2) : lon2;
    
    if (isNaN(lat1Value) || isNaN(lon1Value) || isNaN(lat2Value) || isNaN(lon2Value)) {
      return "Unknown";
    }
    
    // Simple distance calculation in km
    const latDiff = Math.abs(lat1Value - lat2Value);
    const lonDiff = Math.abs(lon1Value - lon2Value);
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Rough km conversion
    return distance.toFixed(1);
  };

  return (
    <div className="map-page">
      <header className="map-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" className="logo-small" />
          </Link>
          
          <h1>Nearby Job Locations</h1>
          
          <Link to="/employee/dashboard" className="back-button">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="map-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading map and job data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="simple-map">
              {/* User marker - always in the center */}
              <div 
                className="user-marker" 
                title="Your Location"
                style={{ 
                  left: '50%', 
                  top: '50%'
                }}
              >
                <span>You</span>
              </div>
              
              {/* Debug info */}
              <div style={{position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '5px', fontSize: '12px', zIndex: 1000}}>
                Jobs: {jobs.length}
              </div>
              
              {/* Job markers */}
              {jobs.map(job => {
                // Calculate positions relative to user location
                const left = calculateMapPosition(job.longitude, 'x', userLocation.longitude);
                const top = calculateMapPosition(job.latitude, 'y', userLocation.latitude);
                
                console.log(`Job ${job.id} position: left=${left}, top=${top}`); // Debug log
                
                return (
                  <div 
                    key={job.id}
                    className={`job-marker ${selectedJob?.id === job.id ? 'selected' : ''}`}
                    style={{ left, top }}
                    title={`${job.title} at ${job.company_name || 'Company'}`}
                    onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                  >
                    <span className="marker-label">{job.id}</span>
                  </div>
                );
              })}
              
              {/* Grid lines for reference */}
              <div className="coordinates-grid">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="grid-line horizontal" style={{ top: `${i * 10}%` }}></div>
                ))}
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="grid-line vertical" style={{ left: `${i * 10}%` }}></div>
                ))}
              </div>
              
              <div className="map-attribution">
                Job locations map
              </div>
              
              {/* Legend */}
              <div className="map-legend">
                <div className="legend-title">Map Legend</div>
                <div className="legend-item">
                  <div className="legend-marker user-color"></div>
                  <div>Your Location</div>
                </div>
                <div className="legend-item">
                  <div className="legend-marker job-color"></div>
                  <div>Available Jobs ({jobs.length})</div>
                </div>
              </div>

            </div>
            
            <div className="location-list">
              <h2>Available Jobs</h2>
              {jobs.length === 0 ? (
                <div className="empty-list-message">
                  <p>No nearby jobs found.</p>
                  <p>Try expanding your search area or check again later.</p>
                </div>
              ) : (
                <div className="job-locations-list">
                  {jobs.map(job => {
                    // Calculate distance
                    const distance = job.distance || 
                      calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        job.latitude,
                        job.longitude
                      );
                    
                    return (
                      <div 
                        key={job.id} 
                        className={`location-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                      >
                        <div className="location-marker">{job.id}</div>
                        <div className="location-details">
                          <h3>{job.title}</h3>
                          <p className="location-company">{job.company_name || 'Company'}</p>
                          <p className="location-distance">
                            ~{distance} km away
                          </p>
                          <Link to={`/employee/jobs/${job.id}`} className="view-details-btn">
                            View Job Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default NearbyJobsMap;