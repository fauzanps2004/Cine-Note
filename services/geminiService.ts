import { GoogleGenAI } from "@google/genai";
import { MovieRecommendation, Language, UpcomingMovie } from "../types";

// Initialize Gemini Client safely
// Check if process is defined to prevent "ReferenceError: process is not defined" in browser
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
const ai = new GoogleGenAI({ apiKey });

export const getMovieRecommendations = async (query: string, lang: Language): Promise<MovieRecommendation[]> => {
  try {
    const prompt = lang === 'id' 
      ? `
      Act as a knowledgeable movie friend.
      Suggest 3 distinct movies based on this user request: "${query}".
      
      Tone: Conversational, specific, witty, and sharp. Avoid generic phrases like "film ini bagus". Tell me why I need to watch it based on my request.
      
      Return strictly a JSON array. No markdown formatting, no code blocks.
      Format: [{"title": "Movie Title", "year": "YYYY", "plot": "Ringkasan plot singkat (maks 20 kata) dalam Bahasa Indonesia.", "reason": "Reason in Indonesian (Conversational/Daily style). Max 30 words."}]
    `
      : `
      Act as a witty, cinephile best friend.
      Suggest 3 distinct movies based on this user request: "${query}".
      
      Tone: Casual, relaxed, specific. Avoid generic praise. Focus on why it fits the request perfectly.
      
      Return strictly a JSON array. No markdown formatting, no code blocks.
      Format: [{"title": "Movie Title", "year": "YYYY", "plot": "Short plot summary (max 20 words) in English.", "reason": "Reason in casual English. Max 30 words."}]
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

export const getUpcomingMovies = async (): Promise<UpcomingMovie[]> => {
  try {
    const today = new Date().toLocaleDateString("id-ID", { month: 'long', year: 'numeric', day: 'numeric' });
    
    // Prompt specifically targets 21cineplex via Google Search
    const prompt = `
      Use Google Search to find the current movie schedule on "21cineplex.com" or "m.21cineplex.com" for today, ${today}.
      
      I need exactly 6 movies found on the 21Cineplex website:
      1. 3 movies listed as "Now Playing" (Sedang Tayang).
      2. 3 movies listed as "Coming Soon" (Akan Tayang) THAT ARE SCHEDULED TO RELEASE WITHIN THE NEXT 1 MONTH ONLY. Do not include movies releasing further in the future.

      CRITICAL INSTRUCTIONS FOR TITLES:
      1. "title": Use the ORIGINAL title shown on the Indonesian website. 
         - If it's an Indonesian movie, use the Indonesian title (e.g. "Agak Laen").
         - If it's a Hollywood movie, use the English title.
      
      2. "searchTitle": Provide the ENGLISH / INTERNATIONAL title specifically for searching on OMDb/IMDb.
         - If it's an Indonesian movie, translate it to the international English title if it exists (e.g. "Siksa Kubur" -> "Grave Torture"). If no English title exists, use the original.
         - If it's a Hollywood movie, this should be the same as "title".
         - Remove any unnecessary punctuation or subtitles if the title is very long to help search accuracy.

      CRITICAL FOR DATES & YEAR:
      - "year": Use the Global/US release year (usually matches OMDb data best).
      - "releaseDate": Include the specific release date (e.g., "14 February 2024") if available.

      Return strictly a valid JSON array. Do not include chatty text or markdown code blocks (like \`\`\`json). Just the raw JSON.
      
      Format: [{"title": "Display Title (ID/EN)", "searchTitle": "OMDb Search Title (EN)", "year": "YYYY", "releaseDate": "DD Month YYYY", "platform": "XXI", "genre": "Genre", "status": "now_playing" or "coming_soon"}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Use Search to get real data from 21cineplex
      },
    });

    const text = response.text || "[]";
    
    // Robust extraction: Find the first '[' and the last ']' to ignore search grounding text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : "[]";
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to fetch upcoming movies:", error);
    // Fallback data if Search/API fails
    return [
      { title: "Dune: Part Two", searchTitle: "Dune Part Two", year: "2024", releaseDate: "28 February 2024", platform: "XXI", genre: "Sci-Fi", status: "now_playing" },
      { title: "Exhuma", searchTitle: "Exhuma", year: "2024", releaseDate: "28 February 2024", platform: "XXI", genre: "Horror", status: "now_playing" },
      { title: "Godzilla x Kong: The New Empire", searchTitle: "Godzilla x Kong The New Empire", year: "2024", releaseDate: "27 March 2024", platform: "XXI", genre: "Action", status: "coming_soon" },
    ];
  }
};