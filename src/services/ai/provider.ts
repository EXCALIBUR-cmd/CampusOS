export interface AIProvider {
  generateResponse(messages: Array<{ role: "user" | "model" | "system"; content: string }>): Promise<string>;
}
