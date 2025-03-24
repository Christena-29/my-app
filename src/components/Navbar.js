import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [search, setSearch] = useState("");

  return (
    <nav className="bg-violet-700 p-4 flex justify-between items-center">
      <div className="text-white text-2xl font-bold">QuickHire</div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 rounded-lg text-gray-900"
      />

      {/* Navigation Links */}
      <div className="space-x-4">
        <Link to="/" className="text-white hover:text-gray-200">Home</Link>
        <Link to="/location" className="text-white hover:text-gray-200">Location Filter</Link>
        <Link to="/profile">
          <img src="/logo.png" alt="Profile" className="w-10 h-10 rounded-full" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
