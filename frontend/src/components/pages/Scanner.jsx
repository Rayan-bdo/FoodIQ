import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function Scanner() {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);

  const handleScan = async (code) => {
    setBarcode(code);

    try {
      const res = await fetch(`http://localhost:5000/api/product/${code}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Erreur:", err);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Scanner 📷</h2>

      <BarcodeScannerComponent
        width={300}
        height={300}
        onUpdate={(err, result) => {
          if (result) {
            handleScan(result.text);
          }
        }}
      />

      <p>Code : {barcode}</p>

      {product && (
        <div>
          <h3>{product.name}</h3>
          <p>Protéines: {product.proteins} g</p>
          <p>Sucre: {product.sugar} g</p>
        </div>
      )}
    </div>
  );
}