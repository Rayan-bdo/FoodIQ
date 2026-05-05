import React, { useState, useEffect } from "react";
import { FaBoxOpen, FaTimes } from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";
import { calculateScore, getScoreColor, getScoreLabel } from "../../utils/scoreUtils";
import "./Historique.css";

const NUTRI_BG = {
  a: "#1e8f4e", b: "#85bb2f", c: "#f9b233", d: "#ee8100", e: "#e63312",
};

/* ---------- Mini Score Circle ---------- */
function MiniScore({ scan, lang }) {
  const score = calculateScore(scan);
  const color = getScoreColor(score);
  const label = getScoreLabel(score, lang);
  const ns = scan.nutriScore?.toLowerCase();
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="mini-score-group">
      {ns && NUTRI_BG[ns] && (
        <div className="mini-nutri-letter" style={{ background: NUTRI_BG[ns] }}>
          {ns.toUpperCase()}
        </div>
      )}
      <div className="mini-score-wrapper">
        <svg width="50" height="50" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r={radius} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle cx="25" cy="25" r={radius} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
            transform="rotate(-90 25 25)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
          <text x="25" y="29" textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{score}</text>
        </svg>
        <span className="mini-score-label" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------- Score Circle (modal) ---------- */
function ScoreCircle({ scan, lang }) {
  const score = calculateScore(scan);
  const color = getScoreColor(score);
  const label = getScoreLabel(score, lang);
  const ns = scan.nutriScore?.toLowerCase();
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="score-group">
      {ns && NUTRI_BG[ns] && (
        <div className="nutri-letter-only" style={{ background: NUTRI_BG[ns] }}>
          {ns.toUpperCase()}
        </div>
      )}
      <div className="score-circle-wrapper">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round"
            transform="rotate(-90 40 40)" style={{ transition: "stroke-dasharray 0.8s ease" }} />
          <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{score}</text>
        </svg>
        <span className="score-circle-label" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/* ---------- Analyse qualités/défauts ---------- */
function analyzeProduct(product, t) {
  const qualities = [];
  const defauts = [];

  if (product.sugar != null) {
    if (product.sugar <= 1) qualities.push({ icon: "🍬", label: t("sugar"), desc: t("qualSugarLow"), value: `${Number(product.sugar).toFixed(1)}g` });
    else if (product.sugar <= 5) qualities.push({ icon: "🍬", label: t("sugar"), desc: t("qualSugarOk"), value: `${Number(product.sugar).toFixed(1)}g` });
    else if (product.sugar <= 10) defauts.push({ icon: "🍬", label: t("sugar"), desc: t("defSugarMed"), value: `${Number(product.sugar).toFixed(1)}g` });
    else defauts.push({ icon: "🍬", label: t("sugar"), desc: t("defSugarHigh"), value: `${Number(product.sugar).toFixed(1)}g` });
  }
  if (product.saturatedFat != null) {
    if (product.saturatedFat <= 0.5) qualities.push({ icon: "🧈", label: t("saturatedFat"), desc: t("qualSatFatLow"), value: `${Number(product.saturatedFat).toFixed(1)}g` });
    else if (product.saturatedFat <= 2) qualities.push({ icon: "🧈", label: t("saturatedFat"), desc: t("qualSatFatOk"), value: `${Number(product.saturatedFat).toFixed(1)}g` });
    else if (product.saturatedFat <= 5) defauts.push({ icon: "🧈", label: t("saturatedFat"), desc: t("defSatFatMed"), value: `${Number(product.saturatedFat).toFixed(1)}g` });
    else defauts.push({ icon: "🧈", label: t("saturatedFat"), desc: t("defSatFatHigh"), value: `${Number(product.saturatedFat).toFixed(1)}g` });
  }
  if (product.salt != null) {
    if (product.salt <= 0.1) qualities.push({ icon: "🧂", label: t("salt"), desc: t("qualSaltLow"), value: `${Number(product.salt).toFixed(1)}g` });
    else if (product.salt <= 0.6) qualities.push({ icon: "🧂", label: t("salt"), desc: t("qualSaltOk"), value: `${Number(product.salt).toFixed(1)}g` });
    else if (product.salt <= 1.5) defauts.push({ icon: "🧂", label: t("salt"), desc: t("defSaltMed"), value: `${Number(product.salt).toFixed(1)}g` });
    else defauts.push({ icon: "🧂", label: t("salt"), desc: t("defSaltHigh"), value: `${Number(product.salt).toFixed(1)}g` });
  }
  if (product.calories != null) {
    if (product.calories <= 50) qualities.push({ icon: "🔥", label: t("calories"), desc: t("qualCalLow"), value: `${Math.round(product.calories)} kcal` });
    else if (product.calories <= 150) qualities.push({ icon: "🔥", label: t("calories"), desc: t("qualCalOk"), value: `${Math.round(product.calories)} kcal` });
    else if (product.calories <= 350) defauts.push({ icon: "🔥", label: t("calories"), desc: t("defCalMed"), value: `${Math.round(product.calories)} kcal` });
    else defauts.push({ icon: "🔥", label: t("calories"), desc: t("defCalHigh"), value: `${Math.round(product.calories)} kcal` });
  }
  if (product.fiber != null) {
    if (product.fiber >= 6) qualities.push({ icon: "🥦", label: t("fiber"), desc: t("qualFiberHigh"), value: `${Number(product.fiber).toFixed(1)}g` });
    else if (product.fiber >= 3) qualities.push({ icon: "🥦", label: t("fiber"), desc: t("qualFiberOk"), value: `${Number(product.fiber).toFixed(1)}g` });
    else if (product.fiber > 0) defauts.push({ icon: "🥦", label: t("fiber"), desc: t("defFiberLow"), value: `${Number(product.fiber).toFixed(1)}g` });
  }
  if (product.proteins != null) {
    if (product.proteins >= 15) qualities.push({ icon: "💪", label: t("proteins"), desc: t("qualProtHigh"), value: `${Number(product.proteins).toFixed(1)}g` });
    else if (product.proteins >= 5) qualities.push({ icon: "💪", label: t("proteins"), desc: t("qualProtOk"), value: `${Number(product.proteins).toFixed(1)}g` });
  }

  return { qualities, defauts };
}

function formatValue(val, unit) {
  if (val == null) return "N/A";
  if (unit === "kcal") return Number(val).toFixed(0);
  if (unit === "mg") return (Number(val) * 1000).toFixed(0);
  return Number(val).toFixed(1);
}

/* ---------- Modal produit ---------- */
function ProductModal({ scan, onClose, lang, t }) {
  const { qualities, defauts } = analyzeProduct(scan, t);

  const allNutrients = [
    { key: "calories", label: t("calories"), unit: "kcal", icon: "🔥" },
    { key: "proteins", label: t("proteins"), unit: "g", icon: "💪" },
    { key: "carbs", label: t("carbs"), unit: "g", icon: "🌾" },
    { key: "fat", label: t("fat"), unit: "g", icon: "🫒" },
    { key: "saturatedFat", label: t("saturatedFat"), unit: "g", icon: "🧈" },
    { key: "sugar", label: t("sugar"), unit: "g", icon: "🍬" },
    { key: "salt", label: t("salt"), unit: "g", icon: "🧂" },
    { key: "sodium", label: t("sodium"), unit: "mg", icon: "⚗️" },
    { key: "fiber", label: t("fiber"), unit: "g", icon: "🥦" },
  ].filter((n) => scan[n.key] != null);

  // Adapter les clés du scan aux clés du produit
  const product = {
    name: scan.productName,
    brand: scan.brand,
    image: scan.image,
    nutriScore: scan.nutriScore,
    calories: scan.calories,
    proteins: scan.proteins,
    carbs: scan.carbs,
    fat: scan.fat,
    saturatedFat: scan.saturatedFat,
    sugar: scan.sugar,
    salt: scan.salt,
    sodium: scan.sodium,
    fiber: scan.fiber,
  };

  return (
    <div className="histo-modal-overlay" onClick={onClose}>
      <div className="histo-modal" onClick={(e) => e.stopPropagation()}>
        {/* Bouton fermer */}
        <button className="histo-modal-close" onClick={onClose}><FaTimes /></button>

        {/* Header produit */}
        <div className="histo-modal-header">
          {product.image && <img src={product.image} alt="" className="histo-modal-img" />}
          <div style={{ flex: 1 }}>
            <h2 className="histo-modal-name">{product.name}</h2>
            <p className="histo-modal-brand">{product.brand}</p>
          </div>
          <ScoreCircle scan={product} lang={lang} />
        </div>

        {/* DÉFAUTS */}
        {defauts.length > 0 && (
          <div className="histo-modal-section">
            <h3 className="histo-modal-section-title defaut-title">⚠️ {t("defauts")}</h3>
            {defauts.map((d, i) => (
              <div key={i} className="histo-modal-item">
                <span className="analysis-icon">{d.icon}</span>
                <div className="analysis-info">
                  <span className="analysis-label">{d.label}</span>
                  <span className="analysis-desc">{d.desc}</span>
                </div>
                <span className="analysis-value defaut-value">{d.value}</span>
                <span className="analysis-dot defaut-dot" />
              </div>
            ))}
          </div>
        )}

        {/* QUALITÉS */}
        {qualities.length > 0 && (
          <div className="histo-modal-section">
            <h3 className="histo-modal-section-title qualite-title">✅ {t("qualites")}</h3>
            {qualities.map((q, i) => (
              <div key={i} className="histo-modal-item">
                <span className="analysis-icon">{q.icon}</span>
                <div className="analysis-info">
                  <span className="analysis-label">{q.label}</span>
                  <span className="analysis-desc">{q.desc}</span>
                </div>
                <span className="analysis-value qualite-value">{q.value}</span>
                <span className="analysis-dot qualite-dot" />
              </div>
            ))}
          </div>
        )}

        {/* VALEURS NUTRITIONNELLES */}
        {allNutrients.length > 0 && (
          <div className="histo-modal-section">
            <h3 className="histo-modal-section-title">{t("nutritionValues")} <span className="per100">pour 100g</span></h3>
            <div className="histo-modal-nutrients">
              {allNutrients.map((n) => (
                <div key={n.key} className="histo-modal-nutrient">
                  <span>{n.icon}</span>
                  <span className="histo-modal-nutrient-label">{n.label}</span>
                  <span className="histo-modal-nutrient-value">{formatValue(scan[n.key], n.unit)} {n.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- MAIN ---------- */
export default function Historique() {
  const { t, lang } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedScan, setSelectedScan] = useState(null);

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
            <div key={index} className="scan-card" onClick={() => setSelectedScan(scan)}>
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
              </div>

              {/* SCORE */}
              <MiniScore scan={scan} lang={lang} />
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedScan && (
        <ProductModal
          scan={selectedScan}
          onClose={() => setSelectedScan(null)}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
}