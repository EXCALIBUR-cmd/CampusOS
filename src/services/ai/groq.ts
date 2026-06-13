import { AIProvider } from "./provider";

export class GroqProvider implements AIProvider {
  async generateResponse(
    messages: Array<{ role: "user" | "model" | "system"; content: string }>
  ): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return "Groq API key is not configured. Please define GROQ_API_KEY in .env.local";
    }

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    try {
      // Map message roles to OpenAI-compatible format that Groq uses
      const groqMessages = messages.map((m) => ({
        role: m.role === "model" ? ("assistant" as const) : m.role,
        content: m.content,
      }));

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Groq API returned status ${response.status}: ${errorBody}`
        );
      }

      const data = await response.json();
      return (
        data?.choices?.[0]?.message?.content ||
        "Unable to extract response from Groq."
      );
    } catch (e: any) {
      return `Groq Provider Error: ${e.message}`;
    }
  }
}
