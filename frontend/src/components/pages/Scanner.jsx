import React, { useRef, useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../translations/LanguageContext";
import { calculateScore, getScoreColor, getScoreLabel } from "../../utils/scoreUtils";
import "./Scanner.css";

/* ---------- Helpers ---------- */
const NUTRI_BG = {
  a: "#1e8f4e", b: "#85bb2f", c: "#f9b233", d: "#ee8100", e: "#e63312",
};

function formatValue(val, unit) {
  if (val == null) return "N/A";
  if (unit === "kcal") return val.toFixed(0);
  if (unit === "mg") return (val * 1000).toFixed(0);
  return val.toFixed(1);
}

/* ---------- Analyse qualités/défauts ---------- */
function analyzeProduct(product, t) {
  const qualities = [];
  const defauts = [];

  if (product.sugar != null) {
    if (product.sugar <= 1)
      qualities.push({ icon: "🍬", label: t("sugar"), desc: t("qualSugarLow"), value: `${product.sugar.toFixed(1)}g` });
    else if (product.sugar <= 5)
      qualities.push({ icon: "🍬", label: t("sugar"), desc: t("qualSugarOk"), value: `${product.sugar.toFixed(1)}g` });
    else if (product.sugar <= 10)
      defauts.push({ icon: "🍬", label: t("sugar"), desc: t("defSugarMed"), value: `${product.sugar.toFixed(1)}g` });
    else
      defauts.push({ icon: "🍬", label: t("sugar"), desc: t("defSugarHigh"), value: `${product.sugar.toFixed(1)}g` });
  }

  if (product.saturatedFat != null) {
    if (product.saturatedFat <= 0.5)
      qualities.push({ icon: "🧈", label: t("saturatedFat"), desc: t("qualSatFatLow"), value: `${product.saturatedFat.toFixed(1)}g` });
    else if (product.saturatedFat <= 2)
      qualities.push({ icon: "🧈", label: t("saturatedFat"), desc: t("qualSatFatOk"), value: `${product.saturatedFat.toFixed(1)}g` });
    else if (product.saturatedFat <= 5)
      defauts.push({ icon: "🧈", label: t("saturatedFat"), desc: t("defSatFatMed"), value: `${product.saturatedFat.toFixed(1)}g` });
    else
      defauts.push({ icon: "🧈", label: t("saturatedFat"), desc: t("defSatFatHigh"), value: `${product.saturatedFat.toFixed(1)}g` });
  }

  if (product.salt != null) {
    if (product.salt <= 0.1)
      qualities.push({ icon: "🧂", label: t("salt"), desc: t("qualSaltLow"), value: `${product.salt.toFixed(1)}g` });
    else if (product.salt <= 0.6)
      qualities.push({ icon: "🧂", label: t("salt"), desc: t("qualSaltOk"), value: `${product.salt.toFixed(1)}g` });
    else if (product.salt <= 1.5)
      defauts.push({ icon: "🧂", label: t("salt"), desc: t("defSaltMed"), value: `${product.salt.toFixed(1)}g` });
    else
      defauts.push({ icon: "🧂", label: t("salt"), desc: t("defSaltHigh"), value: `${product.salt.toFixed(1)}g` });
  }

  if (product.calories != null) {
    if (product.calories <= 50)
      qualities.push({ icon: "🔥", label: t("calories"), desc: t("qualCalLow"), value: `${Math.round(product.calories)} kcal` });
    else if (product.calories <= 150)
      qualities.push({ icon: "🔥", label: t("calories"), desc: t("qualCalOk"), value: `${Math.round(product.calories)} kcal` });
    else if (product.calories <= 350)
      defauts.push({ icon: "🔥", label: t("calories"), desc: t("defCalMed"), value: `${Math.round(product.calories)} kcal` });
    else
      defauts.push({ icon: "🔥", label: t("calories"), desc: t("defCalHigh"), value: `${Math.round(product.calories)} kcal` });
  }

  if (product.fiber != null) {
    if (product.fiber >= 6)
      qualities.push({ icon: "🥦", label: t("fiber"), desc: t("qualFiberHigh"), value: `${product.fiber.toFixed(1)}g` });
    else if (product.fiber >= 3)
      qualities.push({ icon: "🥦", label: t("fiber"), desc: t("qualFiberOk"), value: `${product.fiber.toFixed(1)}g` });
    else if (product.fiber > 0)
      defauts.push({ icon: "🥦", label: t("fiber"), desc: t("defFiberLow"), value: `${product.fiber.toFixed(1)}g` });
  }

  if (product.proteins != null) {
    if (product.proteins >= 15)
      qualities.push({ icon: "💪", label: t("proteins"), desc: t("qualProtHigh"), value: `${product.proteins.toFixed(1)}g` });
    else if (product.proteins >= 5)
      qualities.push({ icon: "💪", label: t("proteins"), desc: t("qualProtOk"), value: `${product.proteins.toFixed(1)}g` });
  }

  return { qualities, defauts };
}

/* ---------- Score Circle ---------- */
function ScoreCircle({ score, lang, ns }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score, lang);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="score-group">
      {ns && (
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

/* ---------- ProductResult ---------- */
function ProductResult({ product, alternatives, altLoading }) {
  const { t, lang } = useLang();
  const ns = product.nutriScore?.toLowerCase();
  const score = calculateScore(product);
  const { qualities, defauts } = analyzeProduct(product, t);

  const allNutrients = [
    { key: "calories",     label: t("calories"),     unit: "kcal", icon: "🔥" },
    { key: "proteins",     label: t("proteins"),     unit: "g",    icon: "💪" },
    { key: "carbs",        label: t("carbs"),        unit: "g",    icon: "🌾" },
    { key: "fat",          label: t("fat"),          unit: "g",    icon: "🫒" },
    { key: "saturatedFat", label: t("saturatedFat"), unit: "g",    icon: "🧈" },
    { key: "sugar",        label: t("sugar"),        unit: "g",    icon: "🍬" },
    { key: "salt",         label: t("salt"),         unit: "g",    icon: "🧂" },
    { key: "sodium",       label: t("sodium"),       unit: "mg",   icon: "⚗️" },
    { key: "fiber",        label: t("fiber"),        unit: "g",    icon: "🥦" },
  ].filter((n) => product[n.key] != null);

  const nutriScoreUpper = product.nutriScore?.toUpperCase();
  const isGoodScore = ["A", "B"].includes(nutriScoreUpper);

  return (
    <div className="product-result">

      {/* HEADER PRODUIT */}
      <div className="product-card">
        <div className="product-header">
          {product.image && <img src={product.image} alt="" className="product-image" />}
          <div style={{ flex: 1 }}>
            <h2>{product.name}</h2>
            <p className="brand">{product.brand}</p>
          </div>
          <ScoreCircle score={score} lang={lang} ns={ns} />
        </div>
      </div>

      {/* DÉFAUTS */}
      {defauts.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title defaut-title">⚠️ {t("defauts")}</h3>
          <div className="analysis-list">
            {defauts.map((d, i) => (
              <div key={i} className="analysis-item">
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
        </div>
      )}

      {/* QUALITÉS */}
      {qualities.length > 0 && (
        <div className="analysis-section">
          <h3 className="analysis-title qualite-title">✅ {t("qualites")}</h3>
          <div className="analysis-list">
            {qualities.map((q, i) => (
              <div key={i} className="analysis-item">
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
        </div>
      )}

      {/* VALEURS NUTRITIONNELLES */}
      <div className="analysis-section">
        <h3 className="analysis-title">{t("nutritionValues")} <span className="per100">pour 100g</span></h3>
        <div className="nutrients-grid">
          {allNutrients.map((n) => (
            <div key={n.key} className="nutrient-card">
              <div className="icon">{n.icon}</div>
              <div className="label">{n.label}</div>
              <div className="value">{formatValue(product[n.key], n.unit)} {n.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ALTERNATIVES PLUS SAINES */}
      <div className="analysis-section">
        <h3 className="analysis-title alternatives-title">🥗 Alternatives plus saines</h3>

        {altLoading && (
          <div className="alt-loading">
            <div className="alt-spinner" />
            <p>Recherche en cours sur Marjane & Aswak Assalam…</p>
          </div>
        )}

        {!altLoading && alternatives.length === 0 && (
          <p className="alt-empty">
            {isGoodScore
              ? `✅ Ce produit a déjà un bon Nutri-Score (${nutriScoreUpper}). Pas d'alternative nécessaire !`
              : "Aucune alternative plus saine trouvée pour ce produit."
            }
          </p>
        )}

        {!altLoading && alternatives.length > 0 && (
          <div className="alt-grid">
            {alternatives.map((alt, i) => (
              <a
                key={i}
                href={alt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="alt-card"
              >
                {alt.image
                  ? <img src={alt.image} alt={alt.titre} className="alt-image" />
                  : <div className="alt-image alt-image-placeholder">🛒</div>
                }
                <div className="alt-body">
                  <p className="alt-titre">{alt.titre}</p>
                  <div className="alt-footer">
                    <span
                      className="alt-nutri-badge"
                      style={{ background: NUTRI_BG[alt.nutriScore?.toLowerCase()] || "#ccc" }}
                    >
                      {alt.nutriScore}
                    </span>
                    <span className="alt-magasin">{alt.magasin}</span>
                    <span className="alt-prix">{alt.prix}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* ---------- MAIN ---------- */
export default function Scanner() {
  const navigate = useNavigate();
  const { t, lang } = useLang();

  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [cameraMode, setCameraMode] = useState("environment");
  const [lock, setLock] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [alternatives, setAlternatives] = useState([]);
  const [altLoading, setAltLoading] = useState(false);

  const scannerRef = useRef(null);

  const safeStop = useCallback(async () => {
    try { if (scannerRef.current) await scannerRef.current.stop().catch(() => {}); } catch (e) {}
    scannerRef.current = null;
    setIsScanning(false);
    setTorchOn(false);
  }, []);

  useEffect(() => { return () => safeStop(); }, [safeStop]);

  const handleScan = async (code) => {
    setIsLoading(true);
    setProduct(null);
    setError("");
    setBarcode("");
    setAlternatives([]);

    try {
      const res = await fetch(`/api/product/${code}?lang=${lang}`, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Introuvable");

      setBarcode(code);
      setProduct(data);
      setError("");

      if (data.nutriScore) {
        const altUrl = `/api/scrape/alternatives?q=${encodeURIComponent(data.name)}&currentScore=${data.nutriScore}`;
        setAltLoading(true);
        fetch(altUrl)
          .then(r => r.json())
          .then(res => setAlternatives(res.alternatives || []))
          .catch(() => setAlternatives([]))
          .finally(() => setAltLoading(false));
      }

      await fetch("/api/scans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          barcode: code, productName: data.name, brand: data.brand,
          image: data.image, nutriScore: data.nutriScore,
          calories: data.calories, proteins: data.proteins, carbs: data.carbs,
          fat: data.fat, saturatedFat: data.saturatedFat, sugar: data.sugar,
          salt: data.salt, sodium: data.sodium, fiber: data.fiber,
        }),
      }).catch(() => {});
    } catch {
      setProduct(null);
      setBarcode("");
      setError(t("productNotFound"));
    } finally {
      setIsLoading(false);
    }
  };

  const startScanner = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setProduct(null);
    setError("");

    const instance = new Html5Qrcode("reader");
    scannerRef.current = instance;

    const viewport = Math.min(window.innerWidth, window.innerHeight);
    const boxW = Math.floor(viewport * 0.85);
    const boxH = Math.floor(boxW * 0.6);

    instance.start(
      { facingMode: cameraMode },
      { fps: 10, qrbox: { width: boxW, height: boxH } },
      async (text) => {
        if (lock) return;
        setLock(true);
        setScanSuccess(true);
        navigator.vibrate?.(200);
        try { new Audio("/beep.mp3").play(); } catch {}
        await safeStop();
        setTimeout(() => {
          setScanSuccess(false);
          handleScan(text);
          setTimeout(() => setLock(false), 1000);
        }, 500);
      }
    );
  }, [cameraMode, isScanning, lock, safeStop]);

  const stopScanner = useCallback(() => safeStop(), [safeStop]);

  const switchCamera = useCallback(() => {
    setCameraMode((prev) => prev === "environment" ? "user" : "environment");
    if (isScanning) { safeStop(); setTimeout(() => startScanner(), 300); }
  }, [isScanning, safeStop, startScanner]);

  const toggleTorch = useCallback(async () => {
    try {
      if (!scannerRef.current) return;
      const newState = !torchOn;
      await scannerRef.current.applyVideoConstraints({ advanced: [{ torch: newState }] });
      setTorchOn(newState);
    } catch (e) { console.warn("Torche non supportée", e); }
  }, [torchOn]);

  const resetScan = useCallback(() => {
    safeStop();
    setBarcode(""); setProduct(null); setError("");
    setManualBarcode(""); setShowManual(false);
    setLock(false); setScanSuccess(false);
    setAlternatives([]); setAltLoading(false);
    const reader = document.getElementById("reader");
    if (reader) reader.innerHTML = "";
  }, [safeStop]);

  return (
    <div className="scanner-app">
      {product && (
        <header className="scanner-header">
          <button className="btn-reset-header" onClick={resetScan}>{t("newScan")}</button>
        </header>
      )}

      <div className="scanner-body">
        {!product && (
          <>
            <div className="scanner-viewfinder fullscreen">
              <div id="reader" />
              <div className="scan-frame">
                <div className="corner tl" /><div className="corner tr" />
                <div className="corner bl" /><div className="corner br" />
                <div className="scan-line" />
              </div>

              <button className={`btn-torch ${torchOn ? "active" : ""}`} onClick={toggleTorch} disabled={!isScanning} aria-label="Lampe torche">🔦</button>
              <button className="btn-switch-top" onClick={switchCamera} aria-label="Changer de caméra">
                {cameraMode === "environment" ? "🤳" : "📷"}
              </button>

              {scanSuccess && (
                <div className="scan-success">
                  <div className="check">✔</div>
                  <p>{t("productDetected")}</p>
                </div>
              )}

              <div className="scanner-actions-overlay">
                {!isScanning ? (
                  <button className="btn-scan" onClick={startScanner}>📷 {t("scanner")}</button>
                ) : (
                  <button className="btn-stop" onClick={stopScanner}>⏹️ {t("stop")}</button>
                )}
                <button className="btn-manual" onClick={() => setShowManual(!showManual)} aria-label="Saisie manuelle">⌨️</button>
              </div>
            </div>

            {showManual && (
              <form className="manual-form" onSubmit={(e) => {
                e.preventDefault();
                if (manualBarcode.trim()) { handleScan(manualBarcode); setManualBarcode(""); setShowManual(false); }
              }}>
                <input value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} placeholder={t("barcodePlaceholder")} />
                <button type="submit">🔍</button>
              </form>
            )}

            {barcode && <p className="barcode-display">Code : <span>{barcode}</span></p>}

            {isLoading && (
              <p style={{ position: "fixed", bottom: "calc(var(--navbar-height) + 160px)", left: 0, right: 0, textAlign: "center", color: "#fff", fontWeight: 700, zIndex: 20, textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                {t("analyzing")}
              </p>
            )}

            {error && (
              <div className="error-banner" style={{ position: "fixed", bottom: "calc(var(--navbar-height) + 160px)", left: 16, right: 16, zIndex: 20 }}>
                😕 {error}
              </div>
            )}
          </>
        )}

        {product && (
          <ProductResult
            product={product}
            alternatives={alternatives}
            altLoading={altLoading}
          />
        )}
      </div>
    </div>
  );
}