import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard"; // Import the Dashboard component
import RegisterPage from "./components/RegisterPage"; // Import the Register component
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Home Page */}
        <Route path="/login" element={<LoginPage />} /> {/* Login Page */}
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard */}
        <Route path="/register" element={<RegisterPage />} /> {/* Register Page */}
      </Routes>
    </Router>
  );
}

export default App;