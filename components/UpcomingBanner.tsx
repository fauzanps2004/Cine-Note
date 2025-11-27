
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
    let results = await searchMovies(searchTitle, year);
    let validResults = getValidPosters(results);
    if (validResults.length > 0) return validResults[0].posterUrl || null;
  }

  // Strategy 2: Try Original Title
  if (originalTitle && originalTitle !== searchTitle) {
    let results = await searchMovies(originalTitle, year);
    let validResults = getValidPosters(results);
    if (validResults.length > 0) return validResults[0].posterUrl || null;
  }

  // Strategy 3: Try Cleaning Title
  const cleanTitle = (t: string) => t.split(/[:|-]/)[0].trim();
  if (searchTitle && (searchTitle.includes(':') || searchTitle.includes('-'))) {
    const clean = cleanTitle(searchTitle);
    if (clean.length > 2) {
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

  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (loading) {
     return (
       <div className="w-full h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse relative overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="h-full flex flex-col justify-center items-center p-6 gap-4">
             <div className="h-32 aspect-[2/3] bg-slate-200 dark:bg-slate-700 rounded-lg shadow-sm"></div>
             <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
             <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
       </div>
     )
  }

  if (movies.length === 0) return null;

  return (
    <div className="w-full animate-fade-in relative group z-0">
      <div className="relative w-full h-64 lg:h-80 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {movies.map((movie, index) => (
          <div 
            key={index}
            className={`
              absolute inset-0 transition-opacity duration-1000 ease-in-out
              ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}
            `}
          >
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
              {movie.posterUrl ? (
                <>
                  <img src={movie.posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60 dark:opacity-40" />
                  <div className="absolute inset-0 backdrop-blur-xl" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full flex flex-col items-center justify-end p-6 text-center">
              
              {/* Badge */}
              <div className="absolute top-4 right-4">
                   <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm
                      ${movie.status === 'now_playing' 
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'}
                    `}>
                     {movie.status === 'now_playing' ? <PlayCircle size={10} fill="currentColor" /> : <CalendarClock size={10} />}
                     {movie.status === 'now_playing' ? t.status_now : t.status_coming}
                   </span>
              </div>

              {/* Poster (Small) */}
              <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/20 mb-3 transform transition-transform duration-700 hover:scale-105 bg-black/50">
                 {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      <Film size={20} />
                    </div>
                 )}
              </div>

              {/* Text */}
              <h2 className="text-lg font-black text-white leading-tight mb-1 line-clamp-2 drop-shadow-md">
                {movie.title}
              </h2>

              <div className="flex flex-wrap justify-center items-center gap-2 text-xs text-slate-300 font-medium">
                   <span>{movie.genre}</span>
                   {movie.releaseDate && (
                      <span className="flex items-center gap-1 text-white/60">
                         • {movie.releaseDate}
                      </span>
                   )}
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
           {movies.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'}`}
              />
           ))}
        </div>
      </div>
    </div>
  );
};
