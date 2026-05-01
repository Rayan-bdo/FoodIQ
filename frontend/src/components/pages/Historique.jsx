import React, { useState, useEffect } from "react";
import { FaBoxOpen } from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";
import { calculateScore, getScoreColor, getScoreLabel } from "../../utils/scoreUtils";
import "./Historique.css";

const getScoreEmoji = (score) => {
  const s = (score || "").toLowerCase();
  if (s === "a" || s === "b") return "✅";
  if (s === "c") return "⚠️";
  if (s === "d" || s === "e") return "❌";
  return "❓";
};

/* ---------- Mini Score Circle ---------- */
function MiniScore({ scan, lang }) {
  const score = calculateScore(scan);
  const color = getScoreColor(score);
  const label = getScoreLabel(score, lang);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="mini-score-wrapper">
      <svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={radius} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="25" cy="25" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 25 25)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="25" y="29" textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>
          {score}
        </text>
      </svg>
      <span className="mini-score-label" style={{ color }}>{label}</span>
    </div>
  );
}

export default function Historique() {
  const { t, lang } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/scans/history", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      } else {
        setError(t("historyError"));
      }
    } catch (err) {
      console.error("Erreur fetch historique:", err);
      setError(t("serverError"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(
      lang === "ar" ? "ar-MA" : lang === "en" ? "en-GB" : "fr-FR",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  if (loading) {
    return (
      <div className="historique-container">
        <div className="historique-loading">
          <div className="loading-spinner" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historique-container">
        <div className="historique-error">😕 {error}</div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <div className="historique-header">
        <h2>🕓 {t("historyTitle")}</h2>
        <span className="historique-count">{history.length} {t("scans")}</span>
      </div>

      {history.length === 0 ? (
        <div className="historique-empty">
          <FaBoxOpen className="empty-icon" />
          <p>{t("historyEmpty")}</p>
        </div>
      ) : (
        <div className="historique-list">
          {history.map((scan, index) => (
            <div key={index} className="scan-card">
              {/* IMAGE */}
              <div className="scan-image">
                {scan.image ? (
                  <img src={scan.image} alt={scan.productName} />
                ) : (
                  <FaBoxOpen className="scan-placeholder-icon" />
                )}
              </div>

              {/* INFO */}
              <div className="scan-info">
                <h4 className="scan-name">{scan.productName || t("unknownProduct")}</h4>
                <p className="scan-brand">{scan.brand || "—"}</p>
                <p className="scan-date">📅 {formatDate(scan.scannedAt)}</p>
                <div className="scan-nutrients">
                  {scan.calories != null && (
                    <span className="nutrient-pill">🔥 {Math.round(scan.calories)} kcal</span>
                  )}
                  {scan.proteins != null && (
                    <span className="nutrient-pill">💪 {Number(scan.proteins).toFixed(1)}g</span>
                  )}
                  {scan.carbs != null && (
                    <span className="nutrient-pill">🌾 {Number(scan.carbs).toFixed(1)}g</span>
                  )}
                  {scan.fat != null && (
                    <span className="nutrient-pill">🫒 {Number(scan.fat).toFixed(1)}g</span>
                  )}
                </div>
              </div>

              {/* SCORE YUKA */}
              <MiniScore scan={scan} lang={lang} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}