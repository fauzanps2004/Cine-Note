
import React, { useState, useEffect } from 'react';
import { getUpcomingMovies } from '../services/geminiService';
import { searchMovies } from '../services/movieService';
import { UpcomingMovie, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { CalendarClock, PlayCircle, Film, Calendar } from 'lucide-react';

interface UpcomingBannerProps {
  language: Language;
}

// Helper to find best poster recursively
const findBestPoster = async (searchTitle: string, originalTitle: string, year?: string): Promise<string | null> => {
  const getValidPosters = (results: any[]) => {
    return results.filter(r => r.posterUrl && r.posterUrl !== "N/A" && r.posterUrl.startsWith('http'));
  };

  // Strategy 1: Try Search Title (English/Optimized) + Year
  if (searchTitle) {
    // searchMovies is now smart enough to handle year boosting internally
    let results = await searchMovies(searchTitle, year);
    let validResults = getValidPosters(results);
    
    if (validResults.length > 0) return validResults[0].posterUrl || null;
  }

  // Strategy 2: Try Original Title (Indonesian/Display) + Year
  if (originalTitle && originalTitle !== searchTitle) {
    let results = await searchMovies(originalTitle, year);
    let validResults = getValidPosters(results);
    
    if (validResults.length > 0) return validResults[0].posterUrl || null;
  }

  // Strategy 3: Try Cleaning Title (Remove subtitles)
  const cleanTitle = (t: string) => t.split(/[:|-]/)[0].trim();
  
  if (searchTitle && (searchTitle.includes(':') || searchTitle.includes('-'))) {
    const clean = cleanTitle(searchTitle);
    if (clean.length > 2) {
      // Pass year here too for context
      let results = await searchMovies(clean, year);
      let validResults = getValidPosters(results);
      if (validResults.length > 0) return validResults[0].posterUrl || null;
    }
  }

  return null;
};

export const UpcomingBanner: React.FC<UpcomingBannerProps> = ({ language }) => {
  const [movies, setMovies] = useState<UpcomingMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const rawMovies = await getUpcomingMovies();

        const enrichedMovies = await Promise.all(
          rawMovies.map(async (movie) => {
            // Use searchTitle if available, otherwise fallback to title
            const searchT = movie.searchTitle || movie.title;
            const posterUrl = await findBestPoster(searchT, movie.title, movie.year);
            return { ...movie, posterUrl };
          })
        );
        
        setMovies(enrichedMovies);
      } catch (error) {
        console.error("Failed to load upcoming movies", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Auto-slide logic (10 seconds)
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (loading) {
     return (
       <div className="w-full mb-10 h-48 sm:h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse relative overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="h-full flex items-center p-4 sm:p-8 gap-4 sm:gap-8">
             {/* Poster Skeleton */}
             <div className="shrink-0 h-full aspect-[2/3] bg-slate-200 dark:bg-slate-700 rounded-xl hidden sm:block shadow-sm"></div>
             <div className="shrink-0 h-32 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg sm:hidden block shadow-sm"></div>

             {/* Text Skeleton */}
             <div className="flex-1 flex flex-col justify-center gap-3 sm:gap-4">
                {/* Badges Line */}
                <div className="flex gap-2">
                   <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                   <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg hidden sm:block"></div>
                </div>
                
                {/* Title Lines */}
                <div className="space-y-2">
                   <div className="h-7 sm:h-9 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                   <div className="h-7 sm:h-9 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-xl hidden sm:block"></div>
                </div>

                {/* Meta Line */}
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mt-1"></div>
             </div>
          </div>
       </div>
     )
  }

  if (movies.length === 0) return null;

  return (
    <div className="w-full mb-10 animate-fade-in relative group z-0">
      <div className="relative w-full h-48 sm:h-64 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {movies.map((movie, index) => (
          <div 
            key={index}
            className={`
              absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            `}
          >
            {/* Dynamic Glassmorphism Background */}
            <div className="absolute inset-0 overflow-hidden">
              {movie.posterUrl ? (
                <>
                  {/* Ambient Color Layer derived from Image */}
                  <img 
                    src={movie.posterUrl} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover blur-3xl scale-150 opacity-60 dark:opacity-40" 
                  />
                  {/* Blur Overlay to make text readable */}
                  <div className="absolute inset-0 backdrop-blur-3xl" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              
              {/* Gradient Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
              
              {/* Glass Border Effect */}
              <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
            </div>

            {/* Content Container */}
            <div className="relative z-20 h-full flex items-center p-4 sm:p-8 gap-4 sm:gap-8">
              
              {/* Poster Image */}
              <div className="shrink-0 h-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 hidden sm:block transform transition-transform duration-700 hover:scale-105 bg-black/50">
                 {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <Film size={32} />
                    </div>
                 )}
              </div>

              {/* Mobile Poster Fallback */}
               <div className="shrink-0 h-32 w-24 rounded-lg overflow-hidden shadow-lg border border-white/20 sm:hidden block bg-black/50">
                 {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <Film size={20} />
                    </div>
                 )}
              </div>

              {/* Info Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                
                {/* Status & Date Badge */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                   <span 
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-sm backdrop-blur-sm
                      ${movie.status === 'now_playing' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'}
                    `}
                   >
                     {movie.status === 'now_playing' ? <PlayCircle size={10} fill="currentColor" /> : <CalendarClock size={10} />}
                     {movie.status === 'now_playing' ? t.status_now : t.status_coming}
                   </span>
                   
                   {movie.releaseDate && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold text-white/80 bg-white/10 border border-white/10 backdrop-blur-sm">
                        <Calendar size={10} />
                        {movie.releaseDate}
                      </span>
                   )}
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight mb-2 line-clamp-2 drop-shadow-lg">
                  {movie.title}
                </h2>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base text-slate-200 font-medium text-shadow">
                   <span>{movie.genre}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                   
                   {/* Platform Badge */}
                   <span 
                     className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wide bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                   >
                     {movie.platform}
                   </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
           {movies.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`
                  w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 shadow-sm
                  ${idx === currentIndex ? 'bg-white w-4 sm:w-6' : 'bg-white/30 hover:bg-white/50'}
                `}
                aria-label={`Go to slide ${idx + 1}`}
              />
           ))}
        </div>
      </div>
    </div>
  );
};
