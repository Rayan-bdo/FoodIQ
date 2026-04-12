import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profil.css";

import { FaChartBar, FaCheckCircle, FaStar } from "react-icons/fa";

export default function Profil() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const stats = {
    scans: 156,
    goodRate: 72,
    favoris: 12,
  };

  const scans = [
    { name: "Granola Bio Miel", brand: "Nature's Path", score: 82, label: "Excellent" },
    { name: "Yaourt Grec Nature", brand: "Fage", score: 71, label: "Bon" },
    { name: "Chips Barbecue", brand: "Lay's", score: 18, label: "Mauvais" }
  ];

  return (
    <div className="profil-container">

      {/* 👤 HEADER */}
      <div className="user-header">
        <h2>👤 {user?.username || "Rayan"}</h2>
        <p>📧 {user?.email || "rayan@gmail.com"}</p>
        <p>📊 Statut : Connecté</p>
      </div>

      {/* 📊 STATS */}
      <div className="stats-container">

        <div className="stat-card">
          <FaChartBar className="stat-icon" />
          <h3>{stats.scans}</h3>
          <p>Scans</p>
        </div>

        <div className="stat-card">
          <FaCheckCircle className="stat-icon" />
          <h3>{stats.goodRate}%</h3>
          <p>Bon choix</p>
        </div>

        <div className="stat-card">
          <FaStar className="stat-icon" />
          <h3>{stats.favoris}</h3>
          <p>Favoris</p>
        </div>

      </div>

      {/* 📜 HISTORY */}
      <div className="history-container">

        <div className="history-header">
          <h3>Derniers scans</h3>
          <span>Voir tout &gt;</span>
        </div>

        {scans.map((item, index) => (
          <div key={index} className="scan-card">
            <div>
              <h4>{item.name}</h4>
              <p>{item.brand}</p>
              <span className={`label ${item.label.toLowerCase()}`}>
                {item.label}
              </span>
            </div>

            <div className={`score ${item.label.toLowerCase()}`}>
              {item.score}
            </div>
          </div>
        ))}

      </div>

      {/* 🚪 LOGOUT */}
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Déconnexion
      </button>

    </div>
  );
}