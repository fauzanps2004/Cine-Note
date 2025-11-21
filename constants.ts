import { UserRole, Review } from './types';
import { Tv, Ticket, Popcorn, Video, Film, Glasses, Disc, Camera, Clapperboard, Award, Crown } from 'lucide-react';

export const STICKY_COLORS = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
  sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
};

export const COLOR_VARIANTS = Object.keys(STICKY_COLORS) as Review['colorVariant'][];

export const STICKY_ROTATIONS = [
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  '-rotate-2',
  'rotate-0'
];

export const LEVEL_MILESTONES = [
  { count: 0, role: UserRole.NOVICE, description: "You've seen a movie. Cute." },
  { count: 25, role: UserRole.LEVEL_1, description: "You watch movies for fun. Normal behavior." },
  { count: 50, role: UserRole.LEVEL_2, description: "The concession stand workers know your name." },
  { count: 75, role: UserRole.LEVEL_3, description: "You've started cancelling plans to watch movies." },
  { count: 100, role: UserRole.LEVEL_4, description: "You log everything. Even the bad ones." },
  { count: 125, role: UserRole.LEVEL_5, description: "You think 4:3 aspect ratio is a personality trait." },
  { count: 150, role: UserRole.LEVEL_6, description: "You spent your rent money on the Criterion sale." },
  { count: 175, role: UserRole.LEVEL_7, description: "You analyze lighting in your sleep." },
  { count: 200, role: UserRole.LEVEL_8, description: "You refuse to watch anything with a Rotten Tomatoes score under 90%." },
  { count: 225, role: UserRole.LEVEL_9, description: "You have strong opinions about the Palme d'Or." },
  { count: 250, role: UserRole.LEVEL_10, description: "Martin Scorsese texts you for recommendations." },
];

// Configuration for 3D Sticker Styles
export const RANK_STYLES = {
    [UserRole.NOVICE]: { gradient: 'from-slate-400 to-slate-500', shadow: '#475569', icon: Tv },
    [UserRole.LEVEL_1]: { gradient: 'from-blue-400 to-blue-500', shadow: '#2563eb', icon: Ticket },
    [UserRole.LEVEL_2]: { gradient: 'from-yellow-400 to-yellow-500', shadow: '#ca8a04', icon: Popcorn },
    [UserRole.LEVEL_3]: { gradient: 'from-green-400 to-green-500', shadow: '#15803d', icon: Video },
    [UserRole.LEVEL_4]: { gradient: 'from-orange-400 to-orange-500', shadow: '#c2410c', icon: Film },
    [UserRole.LEVEL_5]: { gradient: 'from-pink-400 to-pink-500', shadow: '#be185d', icon: Glasses },
    [UserRole.LEVEL_6]: { gradient: 'from-purple-400 to-purple-500', shadow: '#7e22ce', icon: Disc },
    [UserRole.LEVEL_7]: { gradient: 'from-indigo-400 to-indigo-500', shadow: '#4338ca', icon: Camera },
    [UserRole.LEVEL_8]: { gradient: 'from-teal-400 to-teal-500', shadow: '#0f766e', icon: Clapperboard },
    [UserRole.LEVEL_9]: { gradient: 'from-rose-400 to-rose-500', shadow: '#be123c', icon: Award },
    [UserRole.LEVEL_10]: { gradient: 'from-amber-300 to-yellow-500', shadow: '#b45309', icon: Crown },
};

export const MOODS = [
  "Comforting", "Melancholic", "Intense", "Mind-Bending", 
  "Chaotic", "Romantic", "Inspirational", "Terrifying"
];

export const VIBES = [
  "Neon Noir", "90s Grunge", "Dreamlike", "Summer Nostalgia", 
  "Dystopian", "Small Town Mystery", "Ghibli-esque", "Dark Academia"
];

export const MOVIE_QUOTES = [
  { text: "Here's looking at you, kid.", movie: "Casablanca", year: "1942" },
  { text: "May the Force be with you.", movie: "Star Wars", year: "1977" },
  { text: "You're gonna need a bigger boat.", movie: "Jaws", year: "1975" },
  { text: "I see dead people.", movie: "The Sixth Sense", year: "1999" },
  { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather Part II", year: "1974" },
  { text: "Say 'hello' to my little friend!", movie: "Scarface", year: "1983" },
  { text: "Why so serious?", movie: "The Dark Knight", year: "2008" },
  { text: "The first rule of Fight Club is: You do not talk about Fight Club.", movie: "Fight Club", year: "1999" },
  { text: "There's no place like home.", movie: "The Wizard of Oz", year: "1939" },
  { text: "I'm the king of the world!", movie: "Titanic", year: "1997" },
  { text: "Carpe diem. Seize the day, boys.", movie: "Dead Poets Society", year: "1989" },
  { text: "Just keep swimming.", movie: "Finding Nemo", year: "2003" },
  { text: "To infinity and beyond!", movie: "Toy Story", year: "1995" },
  { text: "It's alive! It's alive!", movie: "Frankenstein", year: "1931" },
  { text: "Houston, we have a problem.", movie: "Apollo 13", year: "1995" }
];