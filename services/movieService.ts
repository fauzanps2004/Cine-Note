
import { MovieDetails, MovieSearchResult, UpcomingMovie } from '../types';

// Using a public TMDB API Key for client-side requests to ensure immediate functionality
const API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const IMAGE_LARGE_URL = 'https://image.tmdb.org/t/p/original';

// Helper to normalize strings for comparison (remove special chars, lowercase)
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

const GENRE_MAP: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export const searchMovies = async (query: string, year?: string): Promise<MovieSearchResult[]> => {
  if (!query.trim()) return [];

  try {
    // Search for movies
    // We fetch a bit more (page 1 is usually 20 items) to allow our smart sort to find the gem
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`
    );
    
    if (!response.ok) {
       throw new Error(`TMDB Error: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      const targetYear = year ? parseInt(year) : null;
      const normalizedQuery = normalize(query);

      // Smart Sort: Prioritize Exact Title matches and Year matches over just "Popularity"
      const sortedResults = data.results.sort((a: any, b: any) => {
        let scoreA = 0;
        let scoreB = 0;

        const normA = normalize(a.title);
        const normB = normalize(b.title);
        
        // 1. Title Match Priority
        if (normA === normalizedQuery) scoreA += 1000; // Exact match
        else if (normA.startsWith(normalizedQuery)) scoreA += 100; // Starts with
        else if (normA.includes(normalizedQuery)) scoreA += 10; // Contains

        if (normB === normalizedQuery) scoreB += 1000;
        else if (normB.startsWith(normalizedQuery)) scoreB += 100;
        else if (normB.includes(normalizedQuery)) scoreB += 10;

        // 2. Year Match Priority (with +/- 1 year tolerance)
        if (targetYear) {
          const yearA = a.release_date ? parseInt(a.release_date.substring(0, 4)) : 0;
          const yearB = b.release_date ? parseInt(b.release_date.substring(0, 4)) : 0;

          if (yearA && Math.abs(yearA - targetYear) <= 1) scoreA += 500;
          if (yearB && Math.abs(yearB - targetYear) <= 1) scoreB += 500;
        }

        // 3. Popularity as Tie Breaker (normalized to small impact)
        scoreA += (a.popularity || 0) * 0.01;
        scoreB += (b.popularity || 0) * 0.01;

        return scoreB - scoreA; // Descending score
      });

      return sortedResults.map((item: any) => ({
          title: item.title,
          year: item.release_date ? item.release_date.substring(0, 4) : '',
          imdbID: String(item.id), // Use TMDB ID as the unique identifier
          posterUrl: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null
      }));
    }
    return [];
  } catch (error) {
    console.error("TMDB Search Failed:", error);
    return [];
  }
};

export const getMovieDetails = async (id: string): Promise<MovieDetails | null> => {
  if (!id) return null;

  try {
    // Fetch details with credits (for director) and release dates
    const response = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,release_dates&language=en-US`
    );
    
    if (!response.ok) {
       throw new Error(`TMDB Error: ${response.status}`);
    }

    const data = await response.json();

    // Extract Director
    const director = data.credits?.crew?.find((p: any) => p.job === 'Director')?.name || "Unknown";
    
    // Extract Genres
    const genres = data.genres?.map((g: any) => g.name) || [];

    return {
      title: data.title,
      year: data.release_date ? data.release_date.substring(0, 4) : '',
      director: director,
      genre: genres,
      plot: data.overview || "No plot available.",
      imdbRating: data.vote_average ? String(data.vote_average.toFixed(1)) : "N/A",
      posterUrl: data.poster_path ? `${IMAGE_LARGE_URL}${data.poster_path}` : null, // Use large image for details
      imdbID: String(data.id)
    };
  } catch (error) {
    console.error("TMDB Details Failed:", error);
    throw new Error("Failed to fetch movie details.");
  }
};

export const getCinemaSchedule = async (): Promise<UpcomingMovie[]> => {
  try {
    const [nowPlayingRes, upcomingRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=id-ID&region=ID&page=1`),
      fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=id-ID&region=ID&page=1`)
    ]);

    const nowPlayingData = await nowPlayingRes.json();
    const upcomingData = await upcomingRes.json();

    const mapMovie = (m: any, status: 'now_playing' | 'coming_soon'): UpcomingMovie => {
      const genreName = m.genre_ids && m.genre_ids.length > 0 ? GENRE_MAP[m.genre_ids[0]] : "Movie";
      return {
        title: m.title,
        searchTitle: m.original_title,
        year: m.release_date ? m.release_date.substring(0, 4) : new Date().getFullYear().toString(),
        releaseDate: m.release_date ? new Date(m.release_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : "",
        platform: 'Bioskop',
        genre: genreName || "Movie",
        status: status,
        posterUrl: m.poster_path ? `${IMAGE_LARGE_URL}${m.poster_path}` : null
      };
    };

    const nowPlaying = (nowPlayingData.results || []).slice(0, 5).map((m: any) => mapMovie(m, 'now_playing'));
    
    // Filter upcoming to only show movies releasing in the future
    const today = new Date();
    const upcoming = (upcomingData.results || [])
      .filter((m: any) => new Date(m.release_date) > today)
      .slice(0, 5)
      .map((m: any) => mapMovie(m, 'coming_soon'));

    return [...nowPlaying, ...upcoming];
  } catch (error) {
    console.error("Failed to fetch cinema schedule:", error);
    return [];
  }
};
