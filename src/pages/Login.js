import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'employee' // Default to employee login
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would authenticate the user here
    
    // For now, just redirect based on user type
    if (formData.userType === 'employee') {
      navigate('/employee/dashboard');
    } else {
      navigate('/employer/dashboard');
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
              Job Seeker
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
          
          <button type="submit" className="login-button">
            Login
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