import { AIProvider } from "./provider";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import { GroqProvider } from "./groq";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "gemini";
  switch (provider.toLowerCase()) {
    case "groq":
      return new GroqProvider();
    case "openai":
      return new OpenAIProvider();
    case "gemini":
    default:
      return new GeminiProvider();
  }
}
