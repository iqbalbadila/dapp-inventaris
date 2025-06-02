// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './style/main.scss';
import './style/swal.scss';
import Login from "./pages/Login"; 
import Register from "./pages/Register"
// import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Packages from "./pages/Packages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/packages" element={<Packages />} /> 
        <Route path="/products" element={<Products />} />
        {/* 
        
        <Route path="/orders" element={< Orders />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
