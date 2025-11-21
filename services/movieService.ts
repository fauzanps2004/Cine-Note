import { MovieDetails, MovieSearchResult } from '../types';

const API_KEY = process.env.OMDB_API_KEY;
const BASE_URL = 'https://www.omdbapi.com/';

export const searchMovies = async (query: string): Promise<MovieSearchResult[]> => {
  if (!query.trim()) return [];
  if (!API_KEY) {
    console.error("OMDB_API_KEY is not set in environment variables.");
    return [];
  }

  try {
    // s=query for search, type=movie to filter out series/games
    const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
    const data = await response.json();

    if (data.Response === "True" && Array.isArray(data.Search)) {
      return data.Search.map((item: any) => ({
        title: item.Title,
        year: item.Year,
        imdbID: item.imdbID,
        posterUrl: item.Poster && item.Poster !== "N/A" ? item.Poster : null
      }));
    }
    
    if (data.Error && data.Error !== "Movie not found!") {
        console.warn("OMDb API Error:", data.Error);
    }
    
    return [];
  } catch (error) {
    console.error("OMDb Search Request Failed:", error);
    return [];
  }
};

export const getMovieDetails = async (imdbID: string): Promise<MovieDetails | null> => {
  if (!API_KEY || !imdbID) return null;

  try {
    // i=imdbID for specific details, plot=short for concise summary
    const response = await fetch(`${BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=short`);
    const data = await response.json();

    if (data.Response === "True") {
      return {
        title: data.Title,
        year: data.Year,
        director: data.Director !== "N/A" ? data.Director : "Unknown",
        genre: data.Genre !== "N/A" ? data.Genre.split(', ').map((g: string) => g.trim()) : [],
        plot: data.Plot !== "N/A" ? data.Plot : "No plot available.",
        imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : undefined,
        posterUrl: data.Poster && data.Poster !== "N/A" ? data.Poster : null,
        imdbID: data.imdbID
      };
    }
    return null;
  } catch (error) {
    console.error("OMDb Details Request Failed:", error);
    throw new Error("Failed to fetch movie details.");
  }
};