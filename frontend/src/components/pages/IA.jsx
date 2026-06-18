
import React, { useEffect, useState, useRef } from "react";
import { useLang } from "../../translations/LanguageContext";
import "./IA.css";

const API_BASE = "http://localhost:5000";

// Formate le markdown simple en HTML lisible
function formatMessage(text) {
  if (!text) return "";
  // 1. Gras **texte** (avant de toucher aux *)
  let out = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // 2. Listes numérotées "1. texte"
  out = out.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");
  // 3. Puces : "- ", "• ", ou "* " en début de ligne
  out = out.replace(/^[\-•\*]\s+(.+)$/gm, "<li>$1</li>");
  // 4. Grouper les <li> consécutifs dans un <ul>
  out = out.replace(/((<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  // 5. Sauts de ligne restants → <br>
  out = out.replace(/\n(?!<)/g, "<br/>");
  return out;
}

function MessageContent({ content }) {
  return (
    <div
      className="msg-content"
      dangerouslySetInnerHTML={{ __html: formatMessage(content) }}
    />
  );
}

export default function IA() {
  const { t } = useLang();
  const [lastScan, setLastScan] = useState(null);
  const [scanActive, setScanActive] = useState(true); // false = mode général
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    fetchLastScan();
  }, []);

  const fetchLastScan = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scans/history`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setLastScan(data[0]);
      }
    } catch (err) {
      console.error("Erreur fetch last scan:", err);
    }
  };

  const sendMessage = async () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    setMessages((m) => [...m, { role: "user", content: currentInput }]);
    setInput("");
    setLoading(true);
    setFallbackNotice("");

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: currentInput,
          lastScan: scanActive ? lastScan : null, // n'envoie pas le scan en mode général
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFallbackNotice(
          data.fallback
            ? "Mode secours activé : IA externe indisponible, utilisation d'une réponse locale."
            : ""
        );
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply || "Aucune réponse reçue." },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.error || "Erreur serveur" },
        ]);
      }
    } catch (err) {
      console.error("AI call error:", err);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Erreur de communication avec le serveur AI." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ia-container">
      <header className="ia-header">
        <h2>IA Alimentaire</h2>
        <p className="ia-sub">Parle avec un assistant spécialisé en nutrition.</p>
      </header>

      {lastScan && (
        <div className={`last-scan-card ${!scanActive ? "scan-card-disabled" : ""}`}>
          {lastScan.image && <img src={lastScan.image} alt="" />}
          <div className="last-scan-info">
            <h3>{lastScan.productName}</h3>
            <p>{lastScan.brand}</p>
            <div className="nutri-line">
              Nutri-score: <strong>{lastScan.nutriScore || "—"}</strong>
            </div>
          </div>

          {/* Bouton X pour passer en mode général */}
          <button
            className="scan-dismiss-btn"
            onClick={() => setScanActive((v) => !v)}
            title={scanActive ? "Ignorer ce produit — poser une question générale" : "Réactiver le contexte produit"}
          >
            {scanActive ? "✕" : "↩"}
          </button>
        </div>
      )}

      {/* Badge mode actif */}
      {lastScan && (
        <div className={`ia-mode-badge ${scanActive ? "badge-scan" : "badge-general"}`}>
          {scanActive
            ? `💬 Question sur : ${lastScan.productName}`
            : "🌐 Mode général — pas de produit sélectionné"}
        </div>
      )}

      <div className="chat-wrapper">
        <div className="messages" ref={listRef}>
          {messages.length === 0 && (
            <div className="ia-empty-state">
              {scanActive && lastScan
                ? `Pose une question sur le ${lastScan.productName}, ou demande une alternative.`
                : "Pose ta question sur la nutrition, les aliments, ou tes habitudes alimentaires."}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <MessageContent content={m.content} />
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="msg-content typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              scanActive && lastScan
                ? `Question sur ${lastScan.productName}...`
                : "Pose ta question nutrition..."
            }
          />
          <button onClick={sendMessage} disabled={loading}>
            Envoyer
          </button>
        </div>
      </div>

      {fallbackNotice && (
        <div className="ia-fallback-banner">{fallbackNotice}</div>
      )}
    </div>
  );
}