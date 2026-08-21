/**
 * AI provider abstraction.
 *
 * Primary: Google AI Studio / Gemini 2.0 Flash
 *
 * (Note: GitHub Models was retired on July 30, 2026 and is no longer available)
 */

export interface AIResponse {
  content: string;
  provider: "google-gemini";
}

/**
 * Call Google AI Studio / Gemini API.
 */
export async function callGoogleGemini(prompt: string): Promise<AIResponse> {
  const key = process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_AI_STUDIO_KEY (or GEMINI_API_KEY) is not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Empty response from Gemini API");
  }

  return { content, provider: "google-gemini" };
}

/**
 * Call AI provider (Google AI Studio / Gemini).
 */
export async function callAI(prompt: string): Promise<AIResponse> {
  return await callGoogleGemini(prompt);
}

