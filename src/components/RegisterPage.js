import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/global.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    age: "",
    contactNumber: "",
    email: "",
    aadharNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    const nameRegex = /^[A-Za-z]+$/; // Only letters allowed
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const aadharRegex = /^\d{12}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!nameRegex.test(formData.firstName)) {
      newErrors.firstName = "First name must only contain letters";
    }
    if (!nameRegex.test(formData.lastName)) {
      newErrors.lastName = "Last name must only contain letters";
    }
    if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!aadharRegex.test(formData.aadharNumber)) {
      newErrors.aadharNumber = "Aadhar number must be 12 digits";
    }
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter, 1 number, and 1 special character";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert("Registration successful!");
      navigate("/profile"); // Navigate to the profile creation page
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="input-field"
        />
        {errors.firstName && <p className="error-text">{errors.firstName}</p>}

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="input-field"
        />
        {errors.lastName && <p className="error-text">{errors.lastName}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="input-field"
        />

        <input
          type="date"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="input-field"
        />

        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          className="input-field"
        />
        {errors.contactNumber && <p className="error-text">{errors.contactNumber}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <input
          type="text"
          name="aadharNumber"
          placeholder="Aadhar Number"
          value={formData.aadharNumber}
          onChange={handleChange}
          className="input-field"
        />
        {errors.aadharNumber && <p className="error-text">{errors.aadharNumber}</p>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input-field"
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-field"
        />
        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

        <button type="submit" className="button button-secondary">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;