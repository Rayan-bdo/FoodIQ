import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import { FaBarcode, FaHistory, FaRobot, FaSearch, FaUser } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">

      <div
        className={`nav-item ${isActive("/scanner") ? "active" : ""}`}
        onClick={() => navigate("/scanner")}
      >
        <FaBarcode />
        <span>Scanner</span>
      </div>

      <div
        className={`nav-item ${isActive("/historique") ? "active" : ""}`}
        onClick={() => navigate("/historique")}
      >
        <FaHistory />
        <span>Historique</span>
      </div>

      <div
        className={`nav-item ${isActive("/ia") ? "active" : ""}`}
        onClick={() => navigate("/ia")}
      >
        <FaRobot />
        <span>IA</span>
      </div>

      <div
        className={`nav-item ${isActive("/recherche") ? "active" : ""}`}
        onClick={() => navigate("/recherche")}
      >
        <FaSearch />
        <span>Recherche</span>
      </div>

      <div
        className={`nav-item ${isActive("/profil") ? "active" : ""}`}
        onClick={() => navigate("/profil")}
      >
        <FaUser />
        <span>Profil</span>
      </div>

    </div>
  );
};

export default Navbar;