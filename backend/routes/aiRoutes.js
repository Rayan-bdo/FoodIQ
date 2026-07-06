const express = require("express");
const authMiddleware = require("../security/authMiddleware");

const router = express.Router();

console.log("✅ aiRoutes chargé depuis :", __filename);

const PROVIDER_HF = "huggingface";
const DEFAULT_HF_MODEL =
  process.env.HUGGINGFACE_MODEL || "mistralai/Mistral-7B-Instruct";

function buildFallbackReply(lastScan) {
  let reply =
    "Je n'ai pas accès au service d'IA externe en ce moment, mais je peux quand même te donner un conseil nutritionnel général.";

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

    reply += ` Produit scanné : ${productName || "un produit"}${
      brand ? ` (${brand})` : ""
    }.`;

    if (nutriScore) {
      reply += ` Nutri-score : ${String(nutriScore).toUpperCase()}.`;
    }

    const notes = [];

    if (sugar != null) {
      if (sugar > 10) {
        notes.push(`Riche en sucres (${sugar}g/100g). Limite la consommation.`);
      } else if (sugar > 5) {
        notes.push(`Sucre modéré (${sugar}g/100g).`);
      } else {
        notes.push(`Faible en sucres (${sugar}g/100g).`);
      }
    }

    if (saturatedFat != null) {
      if (saturatedFat > 5) {
        notes.push(`Assez gras en saturés (${saturatedFat}g/100g).`);
      } else if (saturatedFat > 2) {
        notes.push(`Graisses saturées modérées (${saturatedFat}g/100g).`);
      } else {
        notes.push(`Faible en graisses saturées (${saturatedFat}g/100g).`);
      }
    }

    if (salt != null) {
      if (salt > 1.5) {
        notes.push(`Très salé (${salt}g/100g).`);
      } else if (salt > 0.6) {
        notes.push(`Sel modéré (${salt}g/100g).`);
      } else {
        notes.push(`Faible en sel (${salt}g/100g).`);
      }
    }

    if (fiber != null) {
      if (fiber >= 6) {
        notes.push(`Bonne source de fibres (${fiber}g/100g).`);
      } else if (fiber >= 3) {
        notes.push(`Source correcte de fibres (${fiber}g/100g).`);
      } else {
        notes.push(`Peu de fibres (${fiber}g/100g).`);
      }
    }

    if (proteins != null && proteins >= 8) {
      notes.push(`Bonne teneur en protéines (${proteins}g/100g).`);
    }

    if (calories != null) {
      if (calories > 300) {
        notes.push(`Riche en calories (${calories} kcal/100g).`);
      } else if (calories > 150) {
        notes.push(`Calories modérées (${calories} kcal/100g).`);
      } else {
        notes.push(`Calories basses (${calories} kcal/100g).`);
      }
    }

    if (notes.length) {
      reply += ` ${notes.join(" ")}`;
    }

    reply +=
      " En résumé, privilégie des aliments peu transformés, riches en fibres, et limite les produits riches en sucres ajoutés, graisses saturées et sel.";
  } else {
    reply +=
      " Demande-moi conseil sur une alimentation équilibrée, une portion, ou un produit que tu as scanné.";
  }

  return reply;
}

function buildPrompt(message, lastScan) {
  let prompt =
    "Tu es un assistant expert en alimentation, nutrition et santé. Réponds de façon claire, bienveillante et pratique.";

  if (lastScan) {
    prompt += `\nVoici les données du dernier scan : ${JSON.stringify(
      lastScan
    )}.`;
  }

  prompt += `\nUtilisateur : ${message}\nAssistant :`;

  return prompt;
}

// AI Providers: Groq priority → Hugging Face → Local fallback

async function callGroq(message, lastScan) {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    throw new Error("GROQ_API_KEY missing");
  }

  const prompt = buildPrompt(message, lastScan);

  console.log("📡 Calling Groq API...");

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant", // ✅ modèle mis à jour — llama-3.3-70b-versatile déprécié le 16 août 2026
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 650,
        temperature: 0.3,
      }),
    }
  );

  console.log("📡 Groq HTTP status:", response.status);

  const result = await response.json();

  if (!response.ok) {
    const errorMessage =
      result?.error?.message || result?.error || JSON.stringify(result);

    const error = new Error(errorMessage);
    error.status = response.status;
    error.responseBody = result;
    throw error;
  }

  return result.choices?.[0]?.message?.content || null;
}

async function callHuggingFace(message, lastScan) {
  const hfKey = process.env.HUGGINGFACE_API_KEY;

  if (!hfKey) {
    throw new Error("HUGGINGFACE_API_KEY missing");
  }

  const model = process.env.HUGGINGFACE_MODEL || DEFAULT_HF_MODEL;
  const prompt = buildPrompt(message, lastScan);

  console.log("📡 Calling Hugging Face API...");

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 650,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    }
  );

  console.log("📡 Hugging Face HTTP status:", response.status);

  const result = await response.json();

  if (!response.ok) {
    const errorMessage = result?.error || JSON.stringify(result);

    const error = new Error(errorMessage);
    error.status = response.status;
    error.responseBody = result;
    throw error;
  }

  if (typeof result === "string") return result;

  return (
    result.generated_text ||
    result[0]?.generated_text ||
    result?.choices?.[0]?.message?.content ||
    null
  );
}

router.post("/chat", authMiddleware, async (req, res) => {
  console.log("🔥 ROUTE /api/ai/chat appelée");
  console.log("Message reçu:", req.body?.message);
  console.log("Last scan reçu:", !!req.body?.lastScan);
  console.log("GROQ dans route:", !!process.env.GROQ_API_KEY);
  console.log("HF dans route:", !!process.env.HUGGINGFACE_API_KEY);

  try {
    const { message, lastScan } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message manquant" });
    }

    let reply = null;
    let provider = null;
    let lastError = null;

    // Try Groq first
    if (process.env.GROQ_API_KEY) {
      try {
        console.log("AI provider: groq");

        reply = await callGroq(message, lastScan);
        provider = "groq";

        console.log("✅ Groq success");
      } catch (groqErr) {
        lastError = groqErr;

        console.warn("❌ Groq failed DETAILS:", {
          message: groqErr.message,
          cause: groqErr.cause,
          code: groqErr.code,
          name: groqErr.name,
          status: groqErr.status,
          responseBody: groqErr.responseBody,
          stack: groqErr.stack?.split("\n")[0],
        });
      }
    } else {
      console.warn("GROQ_API_KEY not found in process.env");
    }

    // Fallback to Hugging Face
    if (!reply && process.env.HUGGINGFACE_API_KEY) {
      try {
        console.log("AI provider: huggingface");

        reply = await callHuggingFace(message, lastScan);
        provider = PROVIDER_HF;

        console.log("✅ Hugging Face success");
      } catch (hfErr) {
        lastError = hfErr;

        console.warn("❌ Hugging Face failed DETAILS:", {
          message: hfErr.message,
          cause: hfErr.cause,
          code: hfErr.code,
          name: hfErr.name,
          status: hfErr.status,
          responseBody: hfErr.responseBody,
          stack: hfErr.stack?.split("\n")[0],
        });
      }
    }

    // Local fallback
    if (!reply) {
      console.log("AI provider: local fallback");

      reply = buildFallbackReply(lastScan);
      provider = "local";
    }

    if (!reply) {
      return res.status(500).json({ error: "Aucune réponse de l'IA" });
    }

    return res.json({
      reply,
      provider,
      fallback: provider === "local",
      error: provider === "local" ? lastError?.message || null : null,
    });
  } catch (err) {
    console.error("AI chat error:", {
      message: err.message,
      cause: err.cause,
      code: err.code,
      name: err.name,
      status: err.status,
      stack: err.stack?.split("\n")[0],
    });

    const fallbackReply = buildFallbackReply(req.body.lastScan);

    return res.json({
      reply: fallbackReply,
      provider: "local",
      fallback: true,
      error: err.message,
    });
  }
});

module.exports = router;