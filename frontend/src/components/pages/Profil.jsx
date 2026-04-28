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
import { useLang } from "../../translations/LanguageContext";
import "./Profil.css";

export default function Profil() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalScans: 0, goodProducts: 0, badProducts: 0 });
  const [distribution, setDistribution] = useState({ a: 0, b: 0, c: 0, d: 0, e: 0 });
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/profile", { method: "GET", credentials: "include" });
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

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await fetch("/api/scans/history", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("Erreur récupération scans");
        const scans = await res.json();

        const total = scans.length;
        const dist = { a: 0, b: 0, c: 0, d: 0, e: 0 };
        scans.forEach((s) => {
          const score = (s.nutriScore || "").toLowerCase();
          if (dist[score] !== undefined) dist[score]++;
        });

        const good = dist.a + dist.b;
        const bad = dist.d + dist.e;

        const distPct = {
          a: total ? Math.round((dist.a / total) * 100) : 0,
          b: total ? Math.round((dist.b / total) * 100) : 0,
          c: total ? Math.round((dist.c / total) * 100) : 0,
          d: total ? Math.round((dist.d / total) * 100) : 0,
          e: total ? Math.round((dist.e / total) * 100) : 0,
        };

        setStats({ totalScans: total, goodProducts: good, badProducts: bad });
        setDistribution(distPct);
        if (scans.length > 0) setLastScan(scans[0]);
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
      {/* 👤 HEADER */}
      <div className="profil-header">
        <div className="profil-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <div className="profil-info">
          <h2>{user?.name || t("unknownProduct")}</h2>
          <p>{user?.email || "—"}</p>
          <span className="status-badge">● {t("online")}</span>
        </div>
      </div>

      {/* 📊 STATISTIQUES */}
      <section className="section">
        <h3 className="section-title">📊 {t("yourStats")}</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <FaChartBar className="stat-icon blue" />
            <h3>{stats.totalScans}</h3>
            <p>{t("totalScans")}</p>
          </div>
          <div className="stat-card">
            <FaCheckCircle className="stat-icon green" />
            <h3>{stats.goodProducts}</h3>
            <p>{t("goodProducts")}</p>
          </div>
          <div className="stat-card">
            <FaTimesCircle className="stat-icon red" />
            <h3>{stats.badProducts}</h3>
            <p>{t("badProducts")}</p>
          </div>
        </div>
      </section>

      {/* 🥗 ALIMENTATION */}
      <section className="section">
        <h3 className="section-title">🥗 {t("yourDiet")}</h3>
        <div className="nutri-card">
          {["a", "b", "c", "d", "e"].map((grade) => (
            <div key={grade} className="nutri-row">
              <span className={`nutri-badge nutri-${grade}`}>{grade.toUpperCase()}</span>
              <div className="nutri-bar">
                <div className={`nutri-fill nutri-fill-${grade}`} style={{ width: `${distribution[grade]}%` }} />
              </div>
              <span className="nutri-pct">{distribution[grade]}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* 📦 DERNIER SCAN */}
      <section className="section">
        <h3 className="section-title">📦 {t("lastScan")}</h3>
        {loading ? (
          <div className="last-scan-empty">{t("loading")}</div>
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
              <h4>{lastScan.productName || t("unknownProduct")}</h4>
              <p>{lastScan.brand || "—"}</p>
            </div>
            <div className="last-scan-score">
              <span className={`nutri-badge nutri-${(lastScan.nutriScore || "c").toLowerCase()}`}>
                {(lastScan.nutriScore || "?").toUpperCase()}
              </span>
              <span className="last-scan-emoji">{getScoreEmoji(lastScan.nutriScore)}</span>
            </div>
          </div>
        ) : (
          <div className="last-scan-empty">
            <FaBoxOpen /> {t("noScans")}
          </div>
        )}
      </section>

      {/* ⚙️ PARAMÈTRES */}
      <button className="settings-btn" onClick={() => navigate("/parametres")}>
        <FaCog /> {t("settings")}
      </button>
    </div>
  );
}