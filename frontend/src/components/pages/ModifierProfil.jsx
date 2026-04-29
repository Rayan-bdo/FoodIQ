import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaUser, FaEnvelope, FaCheck } from "react-icons/fa";
import { useLang } from "../../translations/LanguageContext";
import "./ModifierProfil.css";

export default function ModifierProfil() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/profile", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("Not authorized");
        const data = await res.json();
        setForm({ name: data.name || "", email: data.email || "" });
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

    if (!form.name.trim() || form.name.length < 2) {
      setError(t("errorNameMin"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t("errorEmailInvalid"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || t("errorUpdate"));
      }

      setSuccess(true);
      setTimeout(() => navigate("/parametres"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="edit-loading">{t("loading")}</div>;

  return (
    <div className="edit-container">
      {/* HEADER */}
      <div className="edit-header">
        <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
        <h2>{t("editProfile")}</h2>
        <div style={{ width: 36 }} />
      </div>

      {/* INITIALE */}
      <div className="avatar-section">
        <div className="avatar-circle-static">
          {form.name.charAt(0).toUpperCase() || "?"}
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label>{t("fullName")}</label>
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("namePlaceholder")}
              maxLength={50}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t("email")}</label>
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
            <FaCheck /> {t("profileUpdated")}
          </div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? t("saving") : `💾 ${t("saveChanges")}`}
        </button>
      </form>
    </div>
  );
}