import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  return (
    <div className="homepage bg-white text-gray-900">
      <Navbar /> {/* Navbar at the top */}
      <div className="flex flex-col items-center justify-center mt-10">
        <h1 className="text-3xl font-bold text-navy-900">Welcome to QuickHire</h1>
        <p className="text-lg text-gray-700">Find part-time jobs with ease</p>

        {/* Image icon leading to Profile Page */}
        <Link to="/profile">
          <img 
            src="/logo.png" 
            alt="Profile Icon" 
            className="w-24 h-24 mt-6 cursor-pointer hover:opacity-80"
          />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
