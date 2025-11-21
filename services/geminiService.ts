
import { GoogleGenAI } from "@google/genai";
import { MovieRecommendation, Language } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMotivationalQuote = async (role: string, lang: Language): Promise<string> => {
  try {
     const prompt = lang === 'id' 
      ? `Generate a short, witty, Letterboxd-style one-liner about watching movies for a user with the rank "${role}". It can be slightly sarcastic, dry, or appreciative. Max 15 words. Output strictly in Indonesian language (Bahasa Indonesia gaul/santai). Do not use quotes.`
      : `Generate a short, witty, Letterboxd-style one-liner about watching movies for a user with the rank "${role}". It can be slightly sarcastic, dry, or appreciative. Max 15 words. Output strictly in English. Do not use quotes.`;

     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || (lang === 'id' ? "Sinema adalah kebenaran 24 frame per detik." : "Cinema is truth at 24 frames per second.");
  } catch (e) {
    return lang === 'id' ? "Sana nonton film." : "Go watch a movie.";
  }
}

export const getMovieRecommendations = async (mood: string, vibe: string, lang: Language): Promise<MovieRecommendation[]> => {
  try {
    const prompt = lang === 'id' 
      ? `
      Suggest 3 distinct movies for someone who is feeling "${mood}" and wants a "${vibe}" atmosphere.
      Return strictly a JSON array. No markdown formatting, no code blocks.
      Format: [{"title": "Movie Title", "year": "YYYY", "plot": "Ringkasan plot singkat (maks 20 kata) dalam Bahasa Indonesia.", "reason": "Penjelasan dengan gaya bahasa 'Whiteboard Journal' (campuran Indonesia-Inggris/Indoglish yang intelektual tapi trendi). Gunakan kata-kata seperti 'aesthetic', 'experience', 'nuance', 'layer', 'cult classic'. Jelaskan kenapa film ini adalah 'essential viewing' untuk mood ini secara singkat."}]
    `
      : `
      Suggest 3 distinct movies for someone who is feeling "${mood}" and wants a "${vibe}" atmosphere.
      Return strictly a JSON array. No markdown formatting, no code blocks.
      Format: [{"title": "Movie Title", "year": "YYYY", "plot": "Short plot summary (max 20 words) in English.", "reason": "Personal, casual, and friendly explanation in English why they must watch this movie right now based on their mood."}]
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
