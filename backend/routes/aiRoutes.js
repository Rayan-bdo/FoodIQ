const express = require("express");
const authMiddleware = require("../security/authMiddleware");

const router = express.Router();

const PROVIDER_HF = "huggingface";
const DEFAULT_HF_MODEL = process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct";

function buildFallbackReply(lastScan) {
  let reply = "Je n'ai pas accès au service d'IA externe en ce moment, mais je peux quand même te donner un conseil nutritionnel général.";

  if (lastScan) {
    const {
      productName,
      brand,
      nutriScore,
      calories,
      sugar,
      saturatedFat,
      salt,
      fiber,
      proteins,
    } = lastScan;

    reply += ` Produit scanné : ${productName || "un produit"}${brand ? ` (${brand})` : ""}.`;
    if (nutriScore) reply += ` Nutri-score : ${nutriScore.toUpperCase()}.`;

    const notes = [];
    if (sugar != null) {
      if (sugar > 10) notes.push(`Riche en sucres (${sugar}g/100g). Limite la consommation.`);
      else if (sugar > 5) notes.push(`Sucre modéré (${sugar}g/100g).`);
      else notes.push(`Faible en sucres (${sugar}g/100g).`);
    }
    if (saturatedFat != null) {
      if (saturatedFat > 5) notes.push(`Assez gras en saturés (${saturatedFat}g/100g).`);
      else if (saturatedFat > 2) notes.push(`Graisses saturées modérées (${saturatedFat}g/100g).`);
      else notes.push(`Faible en graisses saturées (${saturatedFat}g/100g).`);
    }
    if (salt != null) {
      if (salt > 1.5) notes.push(`Très salé (${salt}g/100g).`);
      else if (salt > 0.6) notes.push(`Sel modéré (${salt}g/100g).`);
      else notes.push(`Faible en sel (${salt}g/100g).`);
    }
    if (fiber != null) {
      if (fiber >= 6) notes.push(`Bonne source de fibres (${fiber}g/100g).`);
      else if (fiber >= 3) notes.push(`Source correcte de fibres (${fiber}g/100g).`);
      else notes.push(`Peu de fibres (${fiber}g/100g).`);
    }
    if (proteins != null && proteins >= 8) {
      notes.push(`Bonne teneur en protéines (${proteins}g/100g).`);
    }
    if (calories != null) {
      if (calories > 300) notes.push(`Riche en calories (${calories} kcal/100g).`);
      else if (calories > 150) notes.push(`Calories modérées (${calories} kcal/100g).`);
      else notes.push(`Calories basses (${calories} kcal/100g).`);
    }
    if (notes.length) reply += ` ${notes.join(" ")}`;
    reply += " En résumé, privilégie des aliments peu transformés, riches en fibres, et limite les produits riches en sucres ajoutés, graisses saturées et sel.";
  } else {
    reply += " Demande-moi conseil sur une alimentation équilibrée, une portion, ou un produit que tu as scanné.";
  }
  return reply;
}

function buildPrompt(message, lastScan) {
  let prompt = "Tu es un assistant expert en alimentation, nutrition et santé. Réponds de façon claire, bienveillante et pratique.";
  if (lastScan) {
    prompt += `\nVoici les données du dernier scan : ${JSON.stringify(lastScan)}.`;
  }
  prompt += `\nUtilisateur : ${message}\nAssistant :`;
  return prompt;
}

// AI Providers: Groq (priority) → Hugging Face → Local fallback

async function callGroq(message, lastScan) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) throw new Error("GROQ_API_KEY missing");
  const prompt = buildPrompt(message, lastScan);
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 650,
      temperature: 0.7,
    }),
  });
  const result = await response.json();
  if (!response.ok) {
    const errorMessage = result?.error?.message || result?.error || JSON.stringify(result);
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return result.choices?.[0]?.message?.content || null;
}

async function callHuggingFace(message, lastScan) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (!hfKey) throw new Error("HUGGINGFACE_API_KEY missing");
  const model = process.env.HUGGINGFACE_MODEL || DEFAULT_HF_MODEL;
  const prompt = buildPrompt(message, lastScan);
  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 650, temperature: 0.7, top_p: 0.9 } }),
  });
  const result = await response.json();
  if (!response.ok) {
    const errorMessage = result?.error || JSON.stringify(result);
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  if (typeof result === "string") return result;
  return result.generated_text || result[0]?.generated_text || result?.choices?.[0]?.message?.content || null;
}

function isQuotaError(err) {
  const message = (err?.message || "").toLowerCase();
  return [429, "insufficient_quota"].includes(err?.status)
    || err?.code === "insufficient_quota"
    || /quota|insufficient_quota|fetch failed|getaddrinfo|enotfound|network|timeout|service unavailable|gateway timeout/i.test(message);
}

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, lastScan } = req.body;
    if (!message) return res.status(400).json({ error: "Message manquant" });

    let reply = null;
    let provider = null;

    // Try Groq first
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('AI provider: groq');
        reply = await callGroq(message, lastScan);
        provider = "groq";
      } catch (groqErr) {
        console.warn("Groq failed, trying Hugging Face:", groqErr.message);
      }
    }

    // Fallback to Hugging Face
    if (!reply && process.env.HUGGINGFACE_API_KEY) {
      try {
        console.log('AI provider: huggingface');
        reply = await callHuggingFace(message, lastScan);
        provider = "huggingface";
      } catch (hfErr) {
        console.warn("Hugging Face failed, using local fallback:", hfErr.message);
      }
    }

    // Local fallback
    if (!reply) {
      console.log('AI provider: local fallback');
      reply = buildFallbackReply(lastScan);
      provider = "local";
    }

    if (!reply) {
      return res.status(500).json({ error: "Aucune réponse de l'IA" });
    }
    return res.json({ reply, provider });
  } catch (err) {
    console.error("AI chat error:", err);
    const fallbackReply = buildFallbackReply(req.body.lastScan);
    return res.json({ reply: fallbackReply, provider: "local", error: err.message });
  }
});

module.exports = router;
