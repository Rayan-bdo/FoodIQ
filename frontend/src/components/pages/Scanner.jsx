import React, { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [manualBarcode, setManualBarcode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraMode, setCameraMode] = useState("environment"); // "environment" = back, "user" = front
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrcodeScannerRef.current) {
        try {
          html5QrcodeScannerRef.current.stop().catch(err => console.log("Cleanup error:", err));
        } catch (err) {
          console.log("Cleanup error:", err);
        }
      }
    };
  }, []);

  const startScanner = () => {
    if (isScanning) return;

    setIsScanning(true);
    setBarcode("");
    setError("");
    setProduct(null);

    // Attendre que le DOM soit prêt
    setTimeout(() => {
      try {
        const readerElement = document.getElementById("reader");
        if (!readerElement) {
          setError("Div reader non trouvé");
          setIsScanning(false);
          return;
        }

        // Créer instance Html5Qrcode - configuration simple
        const qrcodeInstance = new Html5Qrcode("reader");

        html5QrcodeScannerRef.current = qrcodeInstance;

        // Configuration simple
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 }
        };

        // Callback de succès
        const onScanSuccess = (decodedText) => {
          console.log("CODE DÉTECTÉ:", decodedText);
          setBarcode(decodedText);
          setIsScanning(false);

          // Arrêter le scanner
          qrcodeInstance.stop().catch(err => console.log("Stop error:", err));

          handleScan(decodedText);
        };

        // Callback d'erreur (silencieux)
        const onScanError = (errorMessage) => {
          // Ignorer les erreurs
        };

        // Démarrer le scanner avec la caméra choisie
        qrcodeInstance.start(
          { facingMode: cameraMode },
          config,
          onScanSuccess,
          onScanError
        );

      } catch (err) {
        console.error("Erreur scanner:", err);
        setError("Erreur scanner: " + err.message);
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (isScanning && html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.stop().catch(err => console.log("Stop error:", err));
        setIsScanning(false);
      } catch (err) {
        console.log("Erreur arrêt scanner:", err);
      }
    }
  };;

  const handleScan = async (code) => {
    if (!code || code.trim() === "") {
      setError("Code vide !");
      return;
    }

    setError("");
    setProduct(null);

    try {
      console.log("CODE ENVOYÉ AU BACKEND :", code);

      const res = await fetch(`/api/product/${code}`);
      const data = await res.json();

      console.log("STATUS BACKEND :", res.status);
      console.log("DATA BACKEND :", data);

      if (!res.ok) {
        setError(data.error || "Produit non trouvé");
        return;
      }

      setProduct(data);

      // Sauvegarder le scan dans l'historique
      fetch('/api/scans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Pour envoyer les cookies
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
          fiber: data.fiber
        })
      }).then(res => {
        if (res.ok) {
          console.log('Scan sauvegardé');
        } else {
          console.log('Erreur sauvegarde scan');
        }
      }).catch(err => console.log('Erreur sauvegarde:', err));
    } catch (err) {
      console.error("ERREUR FETCH :", err);
      setError("Erreur lors de la récupération du produit");
    }
  };

  const resetScan = () => {
    stopScanner();
    setBarcode("");
    setManualBarcode("");
    setProduct(null);
    setError("");
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode);
      setManualBarcode("");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Scanner 📷</h2>

      <div style={{ marginBottom: "15px" }}>
        <p><strong>Choisir la caméra :</strong></p>
        <button
          onClick={() => setCameraMode("environment")}
          style={{
            padding: "10px 20px",
            marginRight: "5px",
            backgroundColor: cameraMode === "environment" ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: cameraMode === "environment" ? "bold" : "normal"
          }}
          disabled={isScanning}
        >
          📷 Caméra Arrière
        </button>
        <button
          onClick={() => setCameraMode("user")}
          style={{
            padding: "10px 20px",
            backgroundColor: cameraMode === "user" ? "#28a745" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: cameraMode === "user" ? "bold" : "normal"
          }}
          disabled={isScanning}
        >
          🤳 Selfie (Avant)
        </button>
      </div>

      <div
        id="reader"
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "300px",
          margin: "0 auto",
          border: "2px solid #ccc",
          borderRadius: "10px",
          overflow: "hidden",
          backgroundColor: "#f0f0f0"
        }}
      />

      {!isScanning && (
        <button
          onClick={startScanner}
          style={{
            padding: "15px 30px",
            margin: "20px 0",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          📷 Démarrer le scanner
        </button>
      )}

      {isScanning && (
        <button
          onClick={stopScanner}
          style={{
            padding: "15px 30px",
            margin: "20px 0",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          ⏹️ Arrêter le scanner
        </button>
      )}

      <p>
        <strong>Code :</strong> {barcode || "Aucun code détecté"}
      </p>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {product && (
        <div style={{
          border: "3px solid #4CAF50",
          padding: "20px",
          borderRadius: "15px",
          backgroundColor: "#f9f9f9",
          marginTop: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "10px",
                marginBottom: "15px"
              }}
            />
          )}

          <h2 style={{ margin: "10px 0", color: "#333" }}>{product.name}</h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "15px" }}>
            {product.brand}
          </p>

          {product.nutriScore && (
            <div style={{
              display: "inline-block",
              padding: "8px 15px",
              backgroundColor: product.nutriScore === "a" ? "#4CAF50" : product.nutriScore === "b" ? "#8BC34A" : product.nutriScore === "c" ? "#FFC107" : product.nutriScore === "d" ? "#FF9800" : "#F44336",
              color: "white",
              borderRadius: "8px",
              fontWeight: "bold",
              marginBottom: "15px",
              textTransform: "uppercase"
            }}>
              Nutri-Score: {product.nutriScore}
            </div>
          )}

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "15px"
          }}>
            <div style={{ backgroundColor: "#E3F2FD", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Calories</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#1976D2" }}>
                {product.calories ? product.calories.toFixed(0) : "N/A"} kcal
              </p>
            </div>

            <div style={{ backgroundColor: "#FCE4EC", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Protéines</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#C2185B" }}>
                {product.proteins ? product.proteins.toFixed(1) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#FFF3E0", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Glucides</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#E65100" }}>
                {product.carbs ? product.carbs.toFixed(1) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#E0F2F1", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Graisses</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#00796B" }}>
                {product.fat ? product.fat.toFixed(1) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#FCE4EC", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Graisses saturées</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#C2185B" }}>
                {product.saturatedFat ? product.saturatedFat.toFixed(1) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#F3E5F5", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Sucres</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#6A1B9A" }}>
                {product.sugar ? product.sugar.toFixed(1) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#EEEEEE", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Sel</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#424242" }}>
                {product.salt ? product.salt.toFixed(2) : "N/A"} g
              </p>
            </div>

            <div style={{ backgroundColor: "#EEEEEE", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Sodium</p>
              <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#424242" }}>
                {product.sodium ? (product.sodium * 1000).toFixed(0) : "N/A"} mg
              </p>
            </div>

            {product.fiber && (
              <div style={{ backgroundColor: "#C8E6C9", padding: "12px", borderRadius: "8px", textAlign: "center" }}>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Fibres</p>
                <p style={{ margin: "5px 0 0 0", fontSize: "18px", fontWeight: "bold", color: "#2E7D32" }}>
                  {product.fiber.toFixed(1)} g
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={resetScan}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🔄 Nouveau scan
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3>Saisir manuellement :</h3>
      <form onSubmit={handleManualSubmit}>
        <input
          type="text"
          placeholder="Collez le code-barres ici..."
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "80%",
            marginBottom: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc"
          }}
        />
        <br />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          🔍 Rechercher
        </button>
      </form>
    </div>
  );
}