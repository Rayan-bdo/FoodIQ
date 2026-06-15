import React, { useEffect, useState, useRef } from "react";
import { useLang } from "../../translations/LanguageContext";
import "./IA.css";

export default function IA() {
  const { t } = useLang();
  const [lastScan, setLastScan] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { fetchLastScan(); }, []);

  const fetchLastScan = async () => {
    try {
      const res = await fetch("/api/scans/history", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setLastScan(data[0]);
      }
    } catch (err) {
      console.error("Erreur fetch last scan:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input, lastScan })
      });
      if (res.ok) {
        const data = await res.json();
          setFallbackNotice(data.fallback ? "Mode secours activé : IA externe indisponible, utilisation d'une réponse locale." : "");
        const botMsg = { role: "assistant", content: data.reply };
        setMessages((m) => [...m, botMsg]);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessages((m) => [...m, { role: "assistant", content: err.error || "Erreur serveur" }]);
      }
    } catch (err) {
      console.error("AI call error:", err);
      setMessages((m) => [...m, { role: "assistant", content: "Erreur de communication avec le serveur AI." }]);
    } finally {
      setLoading(false);
      // scroll
      setTimeout(() => listRef.current?.scrollTo(0, listRef.current.scrollHeight), 50);
    }
  };

  return (
    <div className="ia-container">
      <header className="ia-header">
        <h2>IA Alimentaire</h2>
        <p className="ia-sub">Parle avec un assistant spécialisé en nutrition.</p>
      </header>

      {lastScan && (
        <div className="last-scan-card">
          {lastScan.image && <img src={lastScan.image} alt="" />}
          <div className="last-scan-info">
            <h3>{lastScan.productName}</h3>
            <p>{lastScan.brand}</p>
            <div className="nutri-line">Nutri-score: <strong>{lastScan.nutriScore || '—'}</strong></div>
          </div>
        </div>
      )}

      <div className="chat-wrapper">
        <div className="messages" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div className="msg-content">{m.content}</div>
            </div>
          ))}
          {loading && <div className="message assistant"><div className="msg-content">...</div></div>}
        </div>

        <div className="chat-input">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pose ta question sur ce produit ou sur la nutrition..." />
          <button onClick={sendMessage} disabled={loading}>Envoyer</button>
        </div>
      </div>
      {fallbackNotice && <div className="ia-fallback-banner">{fallbackNotice}</div>}
    </div>
  );
}