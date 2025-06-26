import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminLayout from "./AdminLayout";
import { Toaster } from 'react-hot-toast';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <>
        <AdminLogin onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/*" element={<AdminLayout onLogout={handleLogout} />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
};

export default Admin;