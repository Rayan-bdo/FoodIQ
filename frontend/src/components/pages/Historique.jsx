import React, { useState, useEffect } from "react";
import { FaBoxOpen, FaTrash } from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";
import "./Historique.css";

const SCORE_COLORS = {
  a: "#1e8f4e", b: "#85bb2f", c: "#f9b233", d: "#ee8100", e: "#e63312",
};

const getScoreEmoji = (score) => {
  const s = (score || "").toLowerCase();
  if (s === "a" || s === "b") return "✅";
  if (s === "c") return "⚠️";
  if (s === "d" || s === "e") return "❌";
  return "❓";
};

export default function Historique() {
  const { t, lang } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

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
      {/* HEADER */}
      <div className="historique-header">
        <h2>🕓 {t("historyTitle")}</h2>
        <span className="historique-count">{history.length} {t("scans")}</span>
      </div>

      {/* EMPTY STATE */}
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

                {/* NUTRIENTS */}
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

              {/* SCORE */}
              <div className="scan-score">
                {scan.nutriScore ? (
                  <>
                    <div
                      className="nutri-badge"
                      style={{ background: SCORE_COLORS[scan.nutriScore.toLowerCase()] }}
                    >
                      {scan.nutriScore.toUpperCase()}
                    </div>
                    <span className="score-emoji">{getScoreEmoji(scan.nutriScore)}</span>
                  </>
                ) : (
                  <span className="score-emoji">❓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}