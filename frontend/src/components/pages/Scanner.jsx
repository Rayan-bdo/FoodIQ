import React, { useRef, useState, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./Scanner.css";

export default function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [cameraMode, setCameraMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef(null);

  const safeStop = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear();
      }
    } catch {}
    scannerRef.current = null;
    setIsScanning(false);
    setTorchOn(false);
  }, []);

  useEffect(() => {
    return () => safeStop();
  }, [safeStop]);

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
        setBarcode(text);
        await safeStop();
      }
    );
  }, [cameraMode, isScanning, safeStop]);

  const switchCamera = () => {
    setCameraMode((p) => (p === "environment" ? "user" : "environment"));
    if (isScanning) {
      safeStop();
      setTimeout(startScanner, 300);
    }
  };

  const toggleTorch = async () => {
    try {
      const video = document.querySelector("#reader video");
      const stream = video?.srcObject;
      const track = stream?.getVideoTracks?.()[0];
      const caps = track?.getCapabilities?.();

      if (!caps?.torch) return;

      await track.applyConstraints({
        advanced: [{ torch: !torchOn }],
      });

      setTorchOn((p) => !p);
    } catch {}
  };

  const reset = () => {
    safeStop();
    setBarcode("");
    setProduct(null);
    setError("");
  };

  const hasResult = !!product;

  return (
    <div className="scanner-app">

      {/* HEADER (inchangé) */}
      <header className="scanner-header">
        <h1></h1>

        {hasResult && (
          <button className="btn-reset-header" onClick={reset}>
            Nouveau scan
          </button>
        )}
      </header>

      {/* CAMERA */}
      <div className="scanner-viewfinder">
        <div id="reader" />

        {/* SCAN VERT (inchangé) */}
        <div className="scan-frame">
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
          <div className="scan-line" />
        </div>
      </div>

      {/* BOUTONS (inchangés) */}
      <button className="btn-top btn-torch" onClick={toggleTorch}>
        🔦
      </button>

      <button className="btn-top btn-flip" onClick={switchCamera}>
        🤳
      </button>

      <button
        className="btn-top btn-manual"
        onClick={() => setShowManual((s) => !s)}
      >
        ⌨️
      </button>

      <div className="scanner-actions">
        {!isScanning ? (
          <button className="btn-scan" onClick={startScanner}>
            📷 Scanner
          </button>
        ) : (
          <button className="btn-stop" onClick={safeStop}>
            ⏹️ Stop
          </button>
        )}
      </div>

      {barcode && (
        <div className="barcode-display">Code : {barcode}</div>
      )}

      {showManual && (
        <form className="manual-form">
          <input
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Code-barres"
          />
          <button type="submit">OK</button>
        </form>
      )}

      {error && <div className="error-banner">{error}</div>}
    </div>
  );
}