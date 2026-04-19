import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  FaChartBar,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaBoxOpen,
  FaAppleAlt,
} from "react-icons/fa";
import "./Profil.css";

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalScans: 0,
    goodProducts: 0,
    badProducts: 0,
  });
  const [distribution, setDistribution] = useState({
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
  });
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Récupération de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) throw new Error("Not authorized");

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  // 📊 Récupération des scans + calcul stats
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/scans/history", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erreur récupération scans");

        const scans = await res.json();

        // Total
        const total = scans.length;

        // Distribution Nutri-Score
        const dist = { a: 0, b: 0, c: 0, d: 0, e: 0 };
        scans.forEach((s) => {
          const score = (s.nutriScore || "").toLowerCase();
          if (dist[score] !== undefined) dist[score]++;
        });

        const good = dist.a + dist.b;
        const bad = dist.d + dist.e;

        // Conversion en pourcentages
        const distPct = {
          a: total ? Math.round((dist.a / total) * 100) : 0,
          b: total ? Math.round((dist.b / total) * 100) : 0,
          c: total ? Math.round((dist.c / total) * 100) : 0,
          d: total ? Math.round((dist.d / total) * 100) : 0,
          e: total ? Math.round((dist.e / total) * 100) : 0,
        };

        setStats({
          totalScans: total,
          goodProducts: good,
          badProducts: bad,
        });
        setDistribution(distPct);

        // Dernier scan
        if (scans.length > 0) {
          // On suppose que le backend renvoie déjà trié par date desc
          setLastScan(scans[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  const getScoreEmoji = (score) => {
    const s = (score || "").toLowerCase();
    if (s === "a" || s === "b") return "✅";
    if (s === "c") return "⚠️";
    if (s === "d" || s === "e") return "❌";
    return "❓";
  };

  return (
    <div className="profil-container">
      {/* 👤 HEADER PROFIL */}
      <div className="profil-header">
        <div className="profil-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="profil-info">
          <h2>{user?.name || "Utilisateur"}</h2>
          <p>{user?.email || "—"}</p>
          <span className="status-badge">● En ligne</span>
        </div>
      </div>

      {/* 📊 STATISTIQUES */}
      <section className="section">
        <h3 className="section-title">📊 Tes statistiques</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <FaChartBar className="stat-icon blue" />
            <h3>{stats.totalScans}</h3>
            <p>Total scans</p>
          </div>

          <div className="stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h3>{stats.goodProducts}</h3>
            <p>Bons produits</p>
          </div>

          <div className="stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h3>{stats.badProducts}</h3>
            <p>Mauvais produits</p>
          </div>
        </div>
      </section>

      {/* 🥗 ALIMENTATION */}
      <section className="section">
        <h3 className="section-title">🥗 Ton alimentation</h3>
        <div className="nutri-card">
          {["a", "b", "c", "d", "e"].map((grade) => (
            <div key={grade} className="nutri-row">
              <span className={`nutri-badge nutri-${grade}`}>
                {grade.toUpperCase()}
              </span>
              <div className="nutri-bar">
                <div
                  className={`nutri-fill nutri-fill-${grade}`}
                  style={{ width: `${distribution[grade]}%` }}
                />
              </div>
              <span className="nutri-pct">{distribution[grade]}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* 📦 DERNIER SCAN */}
      <section className="section">
        <h3 className="section-title">📦 Dernier scan</h3>
        {loading ? (
          <div className="last-scan-empty">Chargement…</div>
        ) : lastScan ? (
          <div className="last-scan-card">
            <div className="last-scan-icon">
              {lastScan.image ? (
                <img src={lastScan.image} alt={lastScan.productName} />
              ) : (
                <FaAppleAlt />
              )}
            </div>
            <div className="last-scan-info">
              <h4>{lastScan.productName || "Produit inconnu"}</h4>
              <p>{lastScan.brand || "—"}</p>
            </div>
            <div className="last-scan-score">
              <span
                className={`nutri-badge nutri-${(lastScan.nutriScore || "c").toLowerCase()}`}
              >
                {(lastScan.nutriScore || "?").toUpperCase()}
              </span>
              <span className="last-scan-emoji">
                {getScoreEmoji(lastScan.nutriScore)}
              </span>
            </div>
          </div>
        ) : (
          <div className="last-scan-empty">
            <FaBoxOpen /> Aucun scan pour le moment
          </div>
        )}
      </section>

      {/* ⚙️ BOUTON PARAMÈTRES */}
      <button
        className="settings-btn"
        onClick={() => navigate("/parametres")}
      >
        <FaCog /> Paramètres
      </button>
    </div>
  );
}
