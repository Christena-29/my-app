import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import JobSearch from "./pages/JobSearch";
import JobDetails from "./pages/JobDetails";
import ApplicationTracking from "./pages/ApplicationTracking";
import Messaging from "./pages/Messaging";
import Profile from "./pages/Profile";
import JobPosting from "./pages/JobPosting";
import MapView from "./pages/MapView";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<JobSearch />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/applications" element={<ApplicationTracking />} />
        <Route path="/messages" element={<Messaging />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-job" element={<JobPosting />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </Router>
  );
}

export default App;
