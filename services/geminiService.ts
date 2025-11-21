import { GoogleGenAI } from "@google/genai";
import { MovieRecommendation } from "../types";

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

export const getMovieRecommendations = async (mood: string, vibe: string): Promise<MovieRecommendation[]> => {
  try {
    const prompt = `
      Suggest 3 distinct movies for someone who is feeling "${mood}" and wants a "${vibe}" atmosphere.
      Return strictly a JSON array. No markdown formatting, no code blocks.
      Format: [{"title": "Movie Title", "year": "YYYY", "plot": "Brief plot summary (max 20 words).", "reason": "A personal, casual, and relaxed explanation of why they strictly need to watch this right now based on their mood. Talk to them like a close friend recommending a movie. Don't be formal."}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text || "[]";
    // Clean up markdown if Gemini adds it despite instructions
    const jsonStr = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};