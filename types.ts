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

export enum UserRole {
  NOVICE = "Ticket Buyer",
  ENTHUSIAST = "Popcorn Addict",
  BUFF = "Letterboxd Lurker",
  CINEPHILE = "A24 Stan",
  CRITIC = "Scorsese's Bestie"
}

export interface GamificationState {
  role: UserRole;
  nextMilestone: number;
  progress: number;
}

export interface User {
  id: string;
  username: string;
}