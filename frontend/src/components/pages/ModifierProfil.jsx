import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaCamera,
  FaCheck,
} from "react-icons/fa";
import "./ModifierProfil.css";

export default function ModifierProfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });

  // 🔐 Récup user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authorized");
        const data = await res.json();
        setForm({
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "",
        });
      } catch (err) {
        console.error(err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!form.name.trim() || form.name.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Email invalide");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          avatar: form.avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setSuccess(true);
      setTimeout(() => navigate("/parametres"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-loading">Chargement…</div>;
  }

  return (
    <div className="edit-container">
      {/* HEADER */}
      <div className="edit-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h2>Modifier le profil</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* AVATAR */}
      <div className="avatar-section">
        <div className="avatar-wrapper">
          <div className="avatar-circle">
            {form.avatar ? (
              <img src={form.avatar} alt="avatar" />
            ) : (
              form.name.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <button className="avatar-edit-btn" type="button">
            <FaCamera />
          </button>
        </div>
        <p className="avatar-hint">Appuie pour changer ta photo</p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>Nom complet</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ton nom"
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ton@email.com"
              maxLength={255}
              required
            />
          </div>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}
        {success && (
          <div className="form-success">
            <FaCheck /> Profil mis à jour avec succès !
          </div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? "Enregistrement…" : "💾 Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
