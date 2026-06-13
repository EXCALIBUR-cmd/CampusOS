import { AIProvider } from "./provider";

export class OpenAIProvider implements AIProvider {
  async generateResponse(messages: Array<{ role: "user" | "model" | "system"; content: string }>): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return "OpenAI API key is not configured. Please define OPENAI_API_KEY in environment variables.";
    }

    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role === "model" ? "assistant" : m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: formattedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "Unable to extract response from OpenAI.";
    } catch (e: any) {
      return `OpenAI Provider Execution Error: ${e.message}`;
    }
  }
}
