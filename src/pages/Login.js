import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  
  // State for form data and validation
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'employee' // Default to employee login
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any existing errors when user makes changes
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the login API
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      });
      
      if (response && response.status === 'success' && response.token) {
        // Store token and user info in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('userType', response.userType);
        localStorage.setItem('userName', response.name || 'User');
        
        if (response.userType === 'employer' && response.company_name) {
          localStorage.setItem('companyName', response.company_name);
        }
        
        // Alert the user
        alert('Login successful! Redirecting to dashboard.');
        
        // Redirect based on user type
        if (response.userType === 'employee') {
          navigate('/employee/dashboard');
        } else {
          navigate('/employer/dashboard');
        }
      } else {
        setError(response?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <Link to="/" className="login-logo-link">
          <img 
            src="/logo.png" 
            alt="Job Application Platform Logo" 
            className="login-logo" 
          />
        </Link>
        
        <h1>Welcome Back</h1>
        <p>Sign in to continue to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="user-type-toggle">
            <label className={formData.userType === 'employee' ? 'active' : ''}>
              <input
                type="radio"
                name="userType"
                value="employee"
                checked={formData.userType === 'employee'}
                onChange={handleChange}
              />
              Employee
            </label>
            <label className={formData.userType === 'employer' ? 'active' : ''}>
              <input
                type="radio"
                name="userType"
                value="employer"
                checked={formData.userType === 'employer'}
                onChange={handleChange}
              />
              Employer
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="form-footer">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;