import { AIProvider } from "./provider";

export class GeminiProvider implements AIProvider {
  async generateResponse(messages: Array<{ role: "user" | "model" | "system"; content: string }>): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return "Gemini API key is not configured. Please define GEMINI_API_KEY in environment variables.";
    }

    try {
      const contents = messages.map((m) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to extract response from Gemini.";
    } catch (e: any) {
      return `Gemini Provider Execution Error: ${e.message}`;
    }
  }
}
