import React from "react";
import ReactDOM from "react-dom/client";
import TempApp from "./TempApp";
import "./index.css"; // create this if you haven't yet

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <TempApp />
  </React.StrictMode>
);
