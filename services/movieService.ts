import { MovieDetails, MovieSearchResult } from '../types';

const BASE_URL = 'https://www.omdbapi.com/';

export const setApiKey = (key: string) => {
  if (key) {
    localStorage.setItem('omdb_api_key', key.trim());
  } else {
    localStorage.removeItem('omdb_api_key');
  }
};

const getApiKey = () => {
  // Prioritize localStorage key (user override) so users can update invalid env keys
  const localKey = localStorage.getItem('omdb_api_key');
  if (localKey) return localKey;

  // specific check to avoid reference errors if process is undefined in some environments
  const envKey = (typeof process !== 'undefined' && process.env && process.env.OMDB_API_KEY) ? process.env.OMDB_API_KEY : '';
  return envKey || '';
};

export const hasApiKey = () => !!getApiKey();

export const searchMovies = async (query: string): Promise<MovieSearchResult[]> => {
  if (!query.trim()) return [];
  
  const API_KEY = getApiKey();
  if (!API_KEY) {
    console.warn("OMDb API Key is missing");
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    
    // Fetch Page 1
    const response1 = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodedQuery}&type=movie&page=1`);
    const data1 = await response1.json();

    let allResults: any[] = [];

    if (data1.Response === "True" && Array.isArray(data1.Search)) {
      allResults = [...data1.Search];

      // If there are more results than fit on page 1 (10 items), fetch Page 2 to show more options
      if (parseInt(data1.totalResults, 10) > 10) {
        try {
          const response2 = await fetch(`${BASE_URL}?apikey=${API_KEY}&s=${encodedQuery}&type=movie&page=2`);
          const data2 = await response2.json();
          if (data2.Response === "True" && Array.isArray(data2.Search)) {
            allResults = [...allResults, ...data2.Search];
          }
        } catch (e) {
          // Ignore page 2 errors, just return page 1
        }
      }

      // Deduplicate results based on imdbID
      const uniqueResults = Array.from(new Map(allResults.map(item => [item.imdbID, item])).values());

      return uniqueResults.map((item: any) => ({
        title: item.Title,
        year: item.Year,
        imdbID: item.imdbID,
        posterUrl: item.Poster && item.Poster !== "N/A" ? item.Poster : null
      }));
    }
    
    if (data1.Error && data1.Error !== "Movie not found!") {
        console.warn("OMDb API Error:", data1.Error);
    }
    
    return [];
  } catch (error) {
    console.error("OMDb Search Request Failed:", error);
    return [];
  }
};

export const getMovieDetails = async (imdbID: string): Promise<MovieDetails | null> => {
  const API_KEY = getApiKey();
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