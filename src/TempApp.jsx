import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Admin from "./admin/Admin"; // This is the new router hub file

const TempApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/*" element={<Admin />} />  {/* note the /* for nested routes */}
      </Routes>
    </Router>
  );
};

export default TempApp;
