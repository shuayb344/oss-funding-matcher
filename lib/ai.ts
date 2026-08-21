/**
 * AI provider abstraction.
 *
 * Primary: GitHub Models (free for any GitHub account, fits naturally
 *          since the whole app is GitHub-centric)
 * Fallback: Google AI Studio / Gemini (free, no card)
 *
 * If GitHub Models rate-limits, we fall back to Gemini automatically.
 */

interface AIResponse {
  content: string;
  provider: "github-models" | "google-gemini";
}

/**
 * Call GitHub Models API (OpenAI-compatible endpoint).
 */
async function callGitHubModels(prompt: string): Promise<AIResponse> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  const res = await fetch(
    "https://models.inference.ai.azure.com/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    }
  );

  if (res.status === 429) {
    throw new Error("RATE_LIMITED");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub Models API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from GitHub Models");
  }

  return { content, provider: "github-models" };
}

/**
 * Call Google AI Studio / Gemini API.
 */
async function callGoogleGemini(prompt: string): Promise<AIResponse> {
  const key = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!key) {
    throw new Error("GOOGLE_AI_STUDIO_KEY not configured");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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
    throw new Error("Empty response from Gemini");
  }

  return { content, provider: "google-gemini" };
}

function isRateLimitError(err: unknown): boolean {
  return err instanceof Error && err.message === "RATE_LIMITED";
}

/**
 * Call AI with automatic fallback.
 * Tries GitHub Models first, falls back to Gemini on rate limit.
 */
export async function callAI(prompt: string): Promise<AIResponse> {
  try {
    return await callGitHubModels(prompt);
  } catch (err) {
    if (isRateLimitError(err)) {
      console.log("GitHub Models rate-limited, falling back to Gemini");
      return await callGoogleGemini(prompt);
    }
    throw err;
  }
}
