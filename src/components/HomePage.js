import React from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";

const HomePage = () => {
  return (
    <div className="container">
      <img src="/logo.png" alt="QuickHire Logo" width="500" />
      <h1>Hassle-free Job Hunting</h1>
      <Link to="/login"><button className="button button-primary">Login</button></Link>
      <Link to="/register"><button className="button button-secondary">Register</button></Link>
    </div>
  );
};

export default HomePage;
