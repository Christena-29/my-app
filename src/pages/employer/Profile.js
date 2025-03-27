import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployerProfile, updateEmployerProfile, updatePassword } from '../../services/api';
import '../../styles/Profile.css';

function EmployerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Get employer information from localStorage
  const employerId = localStorage.getItem('userId');
  const employerName = localStorage.getItem('userName') || 'User';
  const userType = localStorage.getItem('userType');
  const companyName = localStorage.getItem('companyName') || '';
  
  // Get employer's initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'User') return 'EM';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  useEffect(() => {
    // Check if user is logged in as an employer
    if (!employerId || userType !== 'employer') {
      alert('Please log in as an employer to view your profile');
      navigate('/login');
      return;
    }
    
    // Fetch profile data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getEmployerProfile(employerId);
        if (profileData.status === 'success') {
          setProfile(profileData.employer);
          setEditableProfile(profileData.employer);
        } else {
          setError(profileData.message || 'Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [employerId, navigate, userType]);
  
  // Handle profile form field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile({
      ...editableProfile,
      [name]: value
    });
  };
  
  // Handle password form field changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      const response = await updateEmployerProfile(employerId, editableProfile);
      
      if (response.status === 'success') {
        setProfile(editableProfile);
        setSaveSuccess(true);
        setIsEditing(false);
        
        // Update localStorage if name or company name changed
        if (profile.name !== editableProfile.name) {
          localStorage.setItem('userName', editableProfile.name);
        }
        
        if (profile.company_name !== editableProfile.company_name) {
          localStorage.setItem('companyName', editableProfile.company_name);
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An unexpected error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const response = await updatePassword(employerId, 'employer', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.status === 'success') {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(response.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An unexpected error occurred');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('companyName');
    navigate('/login');
  };
  
  if (loading && !profile) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <img src="/logo.png" alt="Job Portal Logo" />
          </Link>
          
          <div className="header-nav">
            <Link to="/employer/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/employer/jobs" className="nav-link">My Jobs</Link>
            <Link to="/employer/applications" className="nav-link">Applications</Link>
            <Link to="/employer/profile" className="nav-link active">Profile</Link>
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

      <main className="profile-main">
        <div className="profile-header-section">
          <h1>{isEditing ? 'Edit Profile' : 'Company Profile'}</h1>
          {!isEditing ? (
            <button 
              className="edit-profile-btn" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="cancel-edit-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setEditableProfile({...profile});
                }}
              >
                Cancel
              </button>
              <button 
                className="save-profile-btn" 
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="success-message">
            Profile updated successfully!
          </div>
        )}
        
        <div className="profile-content">
          {!isEditing ? (
            // View Mode
            <>
              <div className="profile-section">
                <h2>Business Information</h2>
                
                <div className="profile-field">
                  <div className="field-label">Company Name</div>
                  <div className="field-value">{profile.company_name}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Contact Name</div>
                  <div className="field-value">{profile.name}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Email</div>
                  <div className="field-value">{profile.email}</div>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Location</h2>
                
                <div className="profile-field">
                  <div className="field-label">Latitude</div>
                  <div className="field-value">{profile.latitude || 'Not provided'}</div>
                </div>
                
                <div className="profile-field">
                  <div className="field-label">Longitude</div>
                  <div className="field-value">{profile.longitude || 'Not provided'}</div>
                </div>
              </div>
              
              <div className="password-section">
                <button
                  className="change-password-btn"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                >
                  {showPasswordSection ? 'Hide Password Form' : 'Change Password'}
                </button>
                
                {showPasswordSection && (
                  <div className="password-form">
                    {passwordError && (
                      <div className="password-error">
                        {passwordError}
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="password-success">
                        {passwordSuccess}
                      </div>
                    )}
                    
                    <h3>Update Your Password</h3>
                    <form onSubmit={handleUpdatePassword}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter your new password"
                        />
                        <span className="field-note">Password must be at least 8 characters long</span>
                      </div>
                      
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      
                      <button type="submit" className="update-password-btn">
                        Update Password
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Edit Mode
            <>
              <div className="form-section">
                <h2>Business Information</h2>
                
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={editableProfile.company_name}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editableProfile.name}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editableProfile.email}
                    onChange={handleProfileChange}
                    disabled // Email cannot be changed
                  />
                  <span className="field-note">Email cannot be changed</span>
                </div>
              </div>
              
              <div className="form-section">
                <h2>Location</h2>
                <p className="location-help">
                  Enter your business coordinates to improve matching with nearby job seekers.
                </p>
                
                <div className="location-fields">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={editableProfile.latitude || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={editableProfile.longitude || ''}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default EmployerProfile;