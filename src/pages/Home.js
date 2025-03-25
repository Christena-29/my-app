import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <img 
          src="/logo.png" 
          alt="Job Application Platform Logo" 
          className="home-logo" 
        />
        <h1>Find Your Dream Job Today</h1>
        <p>Connect with top employers and discover opportunities that match your skills</p>
        
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-login">Login</Link>
          <Link to="/register" className="btn btn-register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;