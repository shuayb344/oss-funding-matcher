

export interface AIResponse {
  content: string;
  provider: "google-gemini" | "groq";
}

async function callGoogleGemini(prompt: string): Promise<AIResponse> {
  const key = process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GOOGLE_AI_STUDIO_KEY not configured");

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash"; // Flash only — Pro is paid-only
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Empty response from Gemini");
  return { content, provider: "google-gemini" };
}

async function callGroq(prompt: string): Promise<AIResponse> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}: ${await res.text()}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from Groq");
  return { content, provider: "groq" };
}

/** Tries Gemini first, falls back to Groq on any Gemini error or rate limit. */
export async function callAI(prompt: string): Promise<AIResponse> {
  try {
    return await callGoogleGemini(prompt);
  } catch (err: any) {
    console.warn(`Gemini API failed (${err?.message || err}). Falling back to Groq...`);
    try {
      return await callGroq(prompt);
    } catch (groqErr: any) {
      console.error(`Groq API fallback also failed (${groqErr?.message || groqErr})`);
      throw new Error(`AI providers failed. Primary error: ${err?.message || err}`);
    }
  }
}