
export interface MovieSearchResult {
  title: string;
  year: string;
  posterUrl?: string | null;
  imdbID?: string;
}

export interface MovieDetails {
  title: string;
  year: string;
  director: string;
  genre: string[];
  plot: string;
  imdbRating?: string;
  posterUrl?: string | null;
  imdbID?: string;
}

export interface Review {
  id: string;
  movieId: string;
  movieDetails: MovieDetails;
  userRating: number; // 1-5
  content: string;
  createdAt: number;
  colorVariant: 'blue' | 'cyan' | 'sky' | 'indigo';
}

export interface MovieRecommendation {
  title: string;
  year: string;
  plot: string;
  reason: string;
  posterUrl?: string | null;
  imdbID?: string;
}

export interface UpcomingMovie {
  title: string; // Display title (Indonesian for local films)
  searchTitle?: string; // OMDb optimized title (English/Intl)
  year?: string;
  releaseDate?: string; // New field for specific date
  platform: string; // e.g., "XXI", "CGV", "Netflix"
  genre: string;
  status: 'now_playing' | 'coming_soon';
  posterUrl?: string | null;
}

export enum UserRole {
  NOVICE = "Newbie",
  LEVEL_1 = "Casual Viewer",
  LEVEL_2 = "Popcorn Addict",
  LEVEL_3 = "Weekend Binger",
  LEVEL_4 = "Letterboxd User",
  LEVEL_5 = "A24 Disciple",
  LEVEL_6 = "Criterion Collector",
  LEVEL_7 = "Film Student",
  LEVEL_8 = "Indie Snob",
  LEVEL_9 = "Festival Juror",
  LEVEL_10 = "Cinema God"
}

export interface GamificationState {
  role: UserRole;
  nextMilestone: number;
  progress: number;
  streak: number;
}

export interface User {
  id: string;
  username: string;
}

export type Language = 'id' | 'en';
