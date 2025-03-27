import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployeeProfile, updateEmployeeProfile, updatePassword } from '../../services/api';
import '../../styles/Profile.css';

function EmployeeProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Get employee information from localStorage
  const employeeId = localStorage.getItem('userId');
  const employeeName = localStorage.getItem('userName') || 'User';
  const userType = localStorage.getItem('userType');
  
  // Get employee's initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'User') return 'EM';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) return name.substring(0, 2).toUpperCase();
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };
  
  useEffect(() => {
    // Check if user is logged in as an employee
    if (!employeeId || userType !== 'employee') {
      alert('Please log in as an employee to view your profile');
      navigate('/login');
      return;
    }
    
    // Fetch profile data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileData = await getEmployeeProfile(employeeId);
        if (profileData && profileData.status === 'success') {
          setProfile(profileData.employee);
          setEditableProfile({...profileData.employee});
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [employeeId, navigate, userType]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddSkill = () => {
    if (skillInput.trim() && editableProfile) {
      const updatedSkills = [...(editableProfile.skills || []), skillInput.trim()];
      setEditableProfile({
        ...editableProfile,
        skills: updatedSkills
      });
      setSkillInput('');
    }
  };
  
  const handleRemoveSkill = (skillToRemove) => {
    if (editableProfile) {
      const updatedSkills = (editableProfile.skills || []).filter(skill => skill !== skillToRemove);
      setEditableProfile({
        ...editableProfile,
        skills: updatedSkills
      });
    }
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSaveSuccess(false);
    
    try {
      const response = await updateEmployeeProfile(employeeId, editableProfile);
      if (response && response.status === 'success') {
        setProfile({...editableProfile});
        setSaveSuccess(true);
        // Update user name in localStorage if it changed
        if (editableProfile.name !== localStorage.getItem('userName')) {
          localStorage.setItem('userName', editableProfile.name);
        }
        setIsEditing(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        setError(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    // Submit password update
    try {
      const response = await updatePassword(employeeId, 'employee', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response && response.status === 'success') {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess('');
          setShowPasswordSection(false);
        }, 3000);
      } else {
        setPasswordError(response?.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('An error occurred while updating your password');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
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
            <Link to="/employee/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/employee/applications" className="nav-link">My Applications</Link>
            <Link to="/employee/profile" className="nav-link active">Profile</Link>
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

      <main className="profile-main">
        <div className="profile-header-section">
          <h1>{isEditing ? 'Edit Profile' : 'Your Profile'}</h1>
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
          {isEditing ? (
            // Edit mode
            <form className="profile-edit-form">
              <div className="form-section">
                <h2>Personal Information</h2>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editableProfile?.name || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editableProfile?.email || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                  <span className="field-note">Email cannot be changed</span>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={editableProfile?.dob || ''}
                    onChange={handleInputChange}
                    disabled
                  />
                  <span className="field-note">Date of birth cannot be changed</span>
                </div>
              </div>
              
              <div className="form-section">
                <h2>Professional Information</h2>
                
                <div className="form-group">
                  <label htmlFor="education">Education</label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={editableProfile?.education || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    min="0"
                    max="50"
                    value={editableProfile?.experience || 0}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Skills</label>
                  <div className="skills-input-container">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill..."
                    />
                    <button 
                      type="button" 
                      onClick={handleAddSkill}
                      className="add-skill-btn"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="skills-list">
                    {editableProfile?.skills?.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(skill)}
                          className="remove-skill-btn"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h2>Location Information</h2>
                
                <div className="location-fields">
                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={editableProfile?.latitude || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. 40.7128"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={editableProfile?.longitude || ''}
                      onChange={handleInputChange}
                      placeholder="e.g. -74.0060"
                    />
                  </div>
                </div>
                
                <p className="location-help">
                  These coordinates help employers find you for nearby job opportunities.
                </p>
              </div>
            </form>
          ) : (
            // View mode
            <div className="profile-view">
              <div className="profile-section">
                <h2>Personal Information</h2>
                <div className="profile-field">
                  <span className="field-label">Full Name:</span>
                  <span className="field-value">{profile?.name || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Email Address:</span>
                  <span className="field-value">{profile?.email || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Date of Birth:</span>
                  <span className="field-value">{profile?.dob || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Professional Information</h2>
                <div className="profile-field">
                  <span className="field-label">Education:</span>
                  <span className="field-value">{profile?.education || 'Not provided'}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Years of Experience:</span>
                  <span className="field-value">{profile?.experience || 0}</span>
                </div>
                <div className="profile-field">
                  <span className="field-label">Skills:</span>
                  <div className="skills-display">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">{skill}</span>
                      ))
                    ) : (
                      <span className="no-skills">No skills listed</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="profile-section">
                <h2>Location Information</h2>
                <div className="profile-field">
                  <span className="field-label">Coordinates:</span>
                  <span className="field-value">
                    {profile?.latitude && profile?.longitude ? 
                      `${profile.latitude}, ${profile.longitude}` : 
                      'Not provided'}
                  </span>
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
                  <form className="password-form" onSubmit={handleUpdatePassword}>
                    <h3>Change Your Password</h3>
                    
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
                    
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    
                    <button type="submit" className="update-password-btn">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default EmployeeProfile;