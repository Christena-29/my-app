import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login successful! Redirecting...");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" className="input-field" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />
        <button type="submit" className="button button-primary">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
