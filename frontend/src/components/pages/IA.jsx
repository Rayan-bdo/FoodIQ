import React, { useEffect, useState, useRef } from "react";
import { useLang } from "../../translations/LanguageContext";
import "./IA.css";

const API_BASE = "http://localhost:5000";

export default function IA() {
  const { t } = useLang();
  const [lastScan, setLastScan] = useState(null);
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
        if (data && data.length > 0) {
          setLastScan(data[0]);
        }
      } else {
        console.warn("Erreur fetch scans:", res.status);
      }
    } catch (err) {
      console.error("Erreur fetch last scan:", err);
    }
  };

  const sendMessage = async () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    const userMsg = {
      role: "user",
      content: currentInput,
    };

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setFallbackNotice("");

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: currentInput,
          lastScan,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFallbackNotice(
          data.fallback
            ? "Mode secours activé : IA externe indisponible, utilisation d'une réponse locale."
            : ""
        );

        const botMsg = {
          role: "assistant",
          content: data.reply || "Aucune réponse reçue.",
        };

        setMessages((m) => [...m, botMsg]);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error || "Erreur serveur",
          },
        ]);
      }
    } catch (err) {
      console.error("AI call error:", err);

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Erreur de communication avec le serveur AI.",
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
      }, 50);
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
            <div className="nutri-line">
              Nutri-score: <strong>{lastScan.nutriScore || "—"}</strong>
            </div>
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

          {loading && (
            <div className="message assistant">
              <div className="msg-content">...</div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question sur ce produit ou sur la nutrition..."
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