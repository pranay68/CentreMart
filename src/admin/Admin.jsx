// admin/Admin.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AddProduct from "./AddProduct";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="add-product" element={<AddProduct />} />
 
      {/* Redirect unknown /admin/* paths to dashboard */}
      <Route path="*" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default Admin;
