import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMotivationalQuote = async (role: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, witty, Letterboxd-style one-liner about watching movies for a user with the rank "${role}". It can be slightly sarcastic, dry, or appreciative. Max 15 words. Do not use quotes.`,
    });
    return response.text || "Cinema is truth at 24 frames per second.";
  } catch (e) {
    return "Go watch something.";
  }
}