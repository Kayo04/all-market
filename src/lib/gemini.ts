// ─────────────────────────────────────────────────────────────────────────────
// Shared Gemini JSON-mode helper.
// Extracted from the inline geminiCategorize() logic in src/app/api/ai-match/route.ts
// so new call sites (e.g. AI Proposal Comparison) don't duplicate the fetch/parse code.
// ai-match/route.ts itself is NOT migrated to use this — it was just fixed/verified
// this session; minimize risk to it. This helper is for new features only.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-flash-latest';

export async function callGeminiJSON<T>(
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxOutputTokens?: number }
): Promise<T | null> {
    if (!process.env.GEMINI_API_KEY) return null;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: userMessage }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: options?.temperature ?? 0.2,
                        maxOutputTokens: options?.maxOutputTokens ?? 800,
                        // Do NOT add thinkingConfig — gemini-flash-latest currently aliases to
                        // a model that 400s on thinkingBudget:0 (confirmed this session).
                    },
                }),
            }
        );

        if (!res.ok) {
            console.warn('[gemini] API returned', res.status);
            return null;
        }

        const data = await res.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) return null;

        return JSON.parse(raw) as T;
    } catch (err) {
        console.warn('[gemini] call failed:', err);
        return null;
    }
}
