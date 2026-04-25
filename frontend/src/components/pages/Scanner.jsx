import React, { useRef, useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import "./Scanner.css";

/* ---------- Helpers ---------- */
const SCORE_LABELS = { a: "Excellent", b: "Bon", c: "Correct", d: "Médiocre", e: "Mauvais" };
const SCORE_COLORS = {
  a: "var(--nutri-a)",
  b: "var(--nutri-b)",
  c: "var(--nutri-c)",
  d: "var(--nutri-d)",
  e: "var(--nutri-e)",
};

const NUTRIENTS = [
  { key: "calories", label: "Calories", unit: "kcal", icon: "🔥", color: "var(--nutrient-calories)" },
  { key: "proteins", label: "Protéines", unit: "g", icon: "💪", color: "var(--nutrient-protein)" },
  { key: "carbs", label: "Glucides", unit: "g", icon: "🌾", color: "var(--nutrient-carbs)" },
  { key: "fat", label: "Lipides", unit: "g", icon: "🫒", color: "var(--nutrient-fat)" },
  { key: "saturatedFat", label: "Saturées", unit: "g", icon: "🧈", color: "var(--nutrient-fat)" },
  { key: "sugar", label: "Sucres", unit: "g", icon: "🍬", color: "var(--nutrient-sugar)" },
  { key: "salt", label: "Sel", unit: "g", icon: "🧂", color: "var(--nutrient-salt)" },
  { key: "sodium", label: "Sodium", unit: "mg", icon: "⚗️", color: "var(--nutrient-salt)" },
  { key: "fiber", label: "Fibres", unit: "g", icon: "🥦", color: "var(--nutrient-fiber)" },
];

function formatValue(val, unit) {
  if (val == null) return "N/A";
  if (unit === "kcal") return val.toFixed(0);
  if (unit === "mg") return (val * 1000).toFixed(0);
  return val.toFixed(1);
}

/* ---------- Product ---------- */
function ProductResult({ product }) {
  const nutrients = NUTRIENTS.filter((n) => product[n.key] != null);
  const ns = product.nutriScore?.toLowerCase();

  return (
    <div style={{ marginTop: 24 }}>
      <div className="product-card">
        <div className="product-header">
          {product.image && (
            <img src={product.image} alt="" className="product-image" />
          )}

          <div>
            <h2>{product.name}</h2>
            <p className="brand">{product.brand}</p>

            {ns && (
              <div className="nutri-score">
                <div className={`badge ${ns}`}>{ns.toUpperCase()}</div>
                <span style={{ color: SCORE_COLORS[ns] }}>
                  {SCORE_LABELS[ns]}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nutrients-grid">
        {nutrients.map((n) => (
          <div key={n.key} className="nutrient-card">
            <div className="icon">{n.icon}</div>
            <div className="label">{n.label}</div>
            <div className="value">
              {formatValue(product[n.key], n.unit)} {n.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- MAIN ---------- */
export default function Scanner() {
  const navigate = useNavigate();
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

  const scannerRef = useRef(null);

  /* ---------- SAFE STOP ---------- */
  const safeStop = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }
    } catch (e) {}
    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => safeStop();
  }, [safeStop]);

  /* ---------- FETCH PRODUCT ---------- */
  const handleScan = async (code) => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/product/${code}`);
      const data = await res.json();

      if (!res.ok) throw new Error();

      setProduct(data);
      setError("");

      // Navigate to product analysis page
      navigate(`/produit/${code}`);

      /* ✅ SAVE SCAN (AJOUT IMPORTANT POUR HISTORIQUE) */
      await fetch("/api/scans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          barcode: code,
          productName: data.name,
          brand: data.brand,
          image: data.image,
          nutriScore: data.nutriScore,
          calories: data.calories,
          proteins: data.proteins,
          carbs: data.carbs,
          fat: data.fat,
          saturatedFat: data.saturatedFat,
          sugar: data.sugar,
          salt: data.salt,
          sodium: data.sodium,
          fiber: data.fiber,
        }),
      }).catch(() => {});

    } catch {
      setError(
        "Produit introuvable. Vérifie le code-barres ou essaie la recherche manuelle."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- START SCANNER ---------- */
  const startScanner = useCallback(() => {
    if (isScanning) return;

    setIsScanning(true);
    setProduct(null);
    setError("");

    const instance = new Html5Qrcode("reader");
    scannerRef.current = instance;

    instance.start(
      { facingMode: cameraMode },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async (text) => {
        if (lock) return;
        setLock(true);

        setBarcode(text);
        setScanSuccess(true);

        navigator.vibrate?.(200);

        try {
          new Audio("/beep.mp3").play();
        } catch {}

        await safeStop();

        setTimeout(() => {
          setScanSuccess(false);
          handleScan(text);
          setTimeout(() => setLock(false), 1000);
        }, 500);
      }
    );
  }, [cameraMode, isScanning, lock, safeStop]);

  /* ---------- STOP ---------- */
  const stopScanner = useCallback(() => {
    safeStop();
  }, [safeStop]);

  /* ---------- SWITCH CAMERA ---------- */
  const switchCamera = useCallback(() => {
    setCameraMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );

    if (isScanning) {
      safeStop();
      setTimeout(() => startScanner(), 300);
    }
  }, [isScanning, safeStop, startScanner]);

  /* ---------- RESET ---------- */
  const resetScan = useCallback(() => {
    safeStop();

    setBarcode("");
    setProduct(null);
    setError("");
    setManualBarcode("");
    setShowManual(false);
    setLock(false);
    setScanSuccess(false);

    const reader = document.getElementById("reader");
    if (reader) reader.innerHTML = "";
  }, [safeStop]);

  return (
    <div className="scanner-app">
      <header className="scanner-header">
        <h1>Food<span>IQ</span></h1>

        {(product || error) && (
          <button className="btn-reset-header" onClick={resetScan}>
            Nouveau scan
          </button>
        )}
      </header>

      <div className="scanner-body">
        {!product && (
          <>
            <div className="scanner-viewfinder">
              <div id="reader" />

              <div className="scan-frame">
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />
                <div className="scan-line" />
              </div>

              {scanSuccess && (
                <div className="scan-success">
                  <div className="check">✔</div>
                  <p>Produit détecté</p>
                </div>
              )}
            </div>

            <div className="scanner-actions">
              {!isScanning ? (
                <button className="btn-scan" onClick={startScanner}>
                  📷 Scanner
                </button>
              ) : (
                <button className="btn-stop" onClick={stopScanner}>
                  ⏹️ Arrêter
                </button>
              )}

              <button className="btn-switch" onClick={switchCamera}>
                {cameraMode === "environment" ? "🤳" : "📷"}
              </button>

              <button
                className="btn-manual"
                onClick={() => setShowManual(!showManual)}
              >
                ⌨️
              </button>
            </div>

            {showManual && (
              <form
                className="manual-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualBarcode.trim()) {
                    setBarcode(manualBarcode);
                    handleScan(manualBarcode);
                    setManualBarcode("");
                    setShowManual(false);
                  }
                }}
              >
                <input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="Code-barres..."
                />
                <button type="submit">🔍</button>
              </form>
            )}

            {barcode && (
              <p className="barcode-display">
                Code : <span>{barcode}</span>
              </p>
            )}
          </>
        )}

        {isLoading && <p>Analyse...</p>}
        {product && <ProductResult product={product} />}
        {error && <div className="error-banner">😕 {error}</div>}
      </div>
    </div>
  );
}