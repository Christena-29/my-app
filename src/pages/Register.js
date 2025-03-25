import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('employee');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Employee specific fields
    dob: '',
    education: '',
    skills: '',
    experience: 0,
    // Employer specific fields
    companyName: '',
    // Location (common for both)
    latitude: '',
    longitude: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate minimum date for DOB (18 years ago)
  const getMaxDobDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Reset form errors when changing user type
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
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
          setErrors({
            ...errors,
            location: "Unable to get your location. Please enter coordinates manually."
          });
          setLoading(false);
        }
      );
    } else {
      setErrors({
        ...errors,
        location: "Geolocation is not supported by your browser."
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Location is required";
    }
    
    // User type specific validation
    if (userType === 'employee') {
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.dob = "You must be at least 18 years old";
        }
      }
      
      if (!formData.education) newErrors.education = "Education is required";
      if (formData.experience < 0) newErrors.experience = "Experience cannot be negative";
      
    } else { // employer validation
      if (!formData.companyName) newErrors.companyName = "Company name is required";
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // In a real app, you would submit this data to your backend
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      console.log("Form submitted:", {
        userType,
        ...formData
      });
      setLoading(false);
      
      // Redirect to the appropriate dashboard
      navigate(userType === 'employee' ? '/employee/dashboard' : '/employer/dashboard');
    }, 1500);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="Job Portal Logo" className="register-logo" />
          </Link>
          <h1>Create an Account</h1>
          <p>Join our platform to connect with jobs and talent</p>
        </div>
        
        <div className="user-type-selector">
          <button 
            className={`user-type-btn ${userType === 'employee' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('employee')}
          >
            Employee
          </button>
          <button 
            className={`user-type-btn ${userType === 'employer' ? 'active' : ''}`}
            onClick={() => handleUserTypeChange('employer')}
          >
            Employer
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          {/* User type specific fields */}
          {userType === 'employee' ? (
            <div className="form-section">
              <h2>Professional Information</h2>
              
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={getMaxDobDate()}
                />
                {errors.dob && <span className="error-message">{errors.dob}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="education">Highest Education</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate's Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Other">Other</option>
                </select>
                {errors.education && <span className="error-message">{errors.education}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="JavaScript, React, Node.js"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                />
                {errors.experience && <span className="error-message">{errors.experience}</span>}
              </div>
            </div>
          ) : (
            <div className="form-section">
              <h2>Company Information</h2>
              
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                />
                {errors.companyName && <span className="error-message">{errors.companyName}</span>}
              </div>
            </div>
          )}
          
          <div className="form-section">
            <h2>Location</h2>
            
            <div className="location-fields">
              <div className="form-group location-btn-container">
                <button 
                  type="button" 
                  className="get-location-btn"
                  onClick={getLocation}
                  disabled={loading}
                >
                  {loading ? "Getting Location..." : "Get My Current Location"}
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
              {errors.location && <span className="error-message location-error">{errors.location}</span>}
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
          
          <div className="login-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;