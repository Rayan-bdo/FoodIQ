import React, { useRef, useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../translations/LanguageContext";
import "./Scanner.css";

/* ---------- Helpers ---------- */
const SCORE_COLORS = {
  a: "var(--nutri-a)",
  b: "var(--nutri-b)",
  c: "var(--nutri-c)",
  d: "var(--nutri-d)",
  e: "var(--nutri-e)",
};

function getNutrients(t) {
  return [
    { key: "calories", label: t("calories"), unit: "kcal", icon: "🔥" },
    { key: "proteins", label: t("proteins"), unit: "g", icon: "💪" },
    { key: "carbs", label: t("carbs"), unit: "g", icon: "🌾" },
    { key: "fat", label: t("fat"), unit: "g", icon: "🫒" },
    { key: "saturatedFat", label: t("saturatedFat"), unit: "g", icon: "🧈" },
    { key: "sugar", label: t("sugar"), unit: "g", icon: "🍬" },
    { key: "salt", label: t("salt"), unit: "g", icon: "🧂" },
    { key: "sodium", label: t("sodium"), unit: "mg", icon: "⚗️" },
    { key: "fiber", label: t("fiber"), unit: "g", icon: "🥦" },
  ];
}

function formatValue(val, unit) {
  if (val == null) return "N/A";
  if (unit === "kcal") return val.toFixed(0);
  if (unit === "mg") return (val * 1000).toFixed(0);
  return val.toFixed(1);
}

/* ---------- Product ---------- */
function ProductResult({ product }) {
  const { t } = useLang();
  const NUTRIENTS = getNutrients(t);
  const nutrients = NUTRIENTS.filter((n) => product[n.key] != null);
  const ns = product.nutriScore?.toLowerCase();
  const scoreLabels = t("nutriScoreLabels");

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
                  {scoreLabels[ns]}
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
    setTorchOn(false);
  }, []);

  useEffect(() => {
    return () => safeStop();
  }, [safeStop]);

  /* ---------- FETCH PRODUCT ---------- */
  const handleScan = async (code) => {
    setIsLoading(true);
    setProduct(null);
    setError("");
    setBarcode("");

    try {
      const res = await fetch(`/api/product/${code}?lang=${lang}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Introuvable");

      setBarcode(code);
      setProduct(data);
      setError("");

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
      setProduct(null);
      setBarcode("");
      setError(t("productNotFound"));
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

  /* ---------- TOGGLE TORCH ---------- */
  const toggleTorch = useCallback(async () => {
    try {
      if (!scannerRef.current) return;
      const newState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: newState }],
      });
      setTorchOn(newState);
    } catch (e) {
      console.warn("Torche non supportée sur cet appareil", e);
    }
  }, [torchOn]);

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
      {product && (
        <header className="scanner-header">
          <button className="btn-reset-header" onClick={resetScan}>
            {t("newScan")}
          </button>
        </header>
      )}

      <div className="scanner-body">
        {!product && (
          <>
            <div className="scanner-viewfinder fullscreen">
              <div id="reader" />

              <div className="scan-frame">
                <div className="corner tl" />
                <div className="corner tr" />
                <div className="corner bl" />
                <div className="corner br" />
                <div className="scan-line" />
              </div>

              <button
                className={`btn-torch ${torchOn ? "active" : ""}`}
                onClick={toggleTorch}
                disabled={!isScanning}
                aria-label="Lampe torche"
              >
                🔦
              </button>

              <button
                className="btn-switch-top"
                onClick={switchCamera}
                aria-label="Changer de caméra"
              >
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
                  <button className="btn-scan" onClick={startScanner}>
                    📷 {t("scanner")}
                  </button>
                ) : (
                  <button className="btn-stop" onClick={stopScanner}>
                    ⏹️ {t("stop")}
                  </button>
                )}

                <button
                  className="btn-manual"
                  onClick={() => setShowManual(!showManual)}
                  aria-label="Saisie manuelle"
                >
                  ⌨️
                </button>
              </div>
            </div>

            {showManual && (
              <form
                className="manual-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualBarcode.trim()) {
                    handleScan(manualBarcode);
                    setManualBarcode("");
                    setShowManual(false);
                  }
                }}
              >
                <input
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder={t("barcodePlaceholder")}
                />
                <button type="submit">🔍</button>
              </form>
            )}

            {barcode && (
              <p className="barcode-display">
                Code : <span>{barcode}</span>
              </p>
            )}

            {isLoading && (
              <p
                style={{
                  position: "fixed",
                  bottom: "calc(var(--navbar-height) + 160px)",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: 700,
                  zIndex: 20,
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}
              >
                {t("analyzing")}
              </p>
            )}

            {error && (
              <div
                className="error-banner"
                style={{
                  position: "fixed",
                  bottom: "calc(var(--navbar-height) + 160px)",
                  left: 16,
                  right: 16,
                  zIndex: 20,
                }}
              >
                😕 {error}
              </div>
            )}
          </>
        )}

        {product && <ProductResult product={product} />}
      </div>
    </div>
  );
}