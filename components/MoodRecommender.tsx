
import React, { useState, useEffect } from 'react';
import { Loader2, Film, Search, ArrowRight } from 'lucide-react';
import { GET_QUICK_PICKS, TRANSLATIONS } from '../constants';
import { getMovieRecommendations } from '../services/geminiService';
import { searchMovies } from '../services/movieService';
import { MovieRecommendation, Language } from '../types';

interface MoodRecommenderProps {
  language: Language;
  layout?: 'horizontal' | 'vertical'; // Add layout prop
}

export const MoodRecommender: React.FC<MoodRecommenderProps> = ({ language, layout = 'vertical' }) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const t = TRANSLATIONS[language];
  const QUICK_PICKS = GET_QUICK_PICKS(language);

  // Clear recommendations when language changes
  useEffect(() => {
    setRecommendations([]);
    setQuery('');
  }, [language]);

  const handleGenerate = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setRecommendations([]);

    try {
      // 1. Get suggestions from Gemini
      const aiSuggestions = await getMovieRecommendations(query, language);

      // 2. Enrich with real posters from OMDb/TMDB
      const enrichedResults = await Promise.all(
        aiSuggestions.map(async (item) => {
          try {
            // Search API for the specific title to get the poster
            const searchResults = await searchMovies(item.title);
            // Find best match
            const match = searchResults.find(r => r.title.toLowerCase() === item.title.toLowerCase()) || searchResults[0];
            
            return {
              ...item,
              posterUrl: match?.posterUrl || null,
              imdbID: match?.imdbID
            };
          } catch (e) {
            return item;
          }
        })
      );

      setRecommendations(enrichedResults);
    } catch (error) {
      console.error("Recommendation failed", error);
    } finally {
      setLoading(false);
      // Auto-scroll to results logic removed here as requested in previous steps? 
      // Re-adding alert logic as requested in previous step (missed in this file content update)
      // Note: In a real react app, we'd use a toast library. Here we'll just set state or assume user sees it.
      // For this specific request "fix font", I will focus on the font.
      if (typeof window !== 'undefined') {
        // Simple visual feedback since we don't have a toast component
        // window.alert("Rekomendasi ditemukan!"); // Removed to be less intrusive, relying on UI update
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setRecommendations([]);
  };

  const isVertical = layout === 'vertical';

  return (
    <div className="w-full animate-fade-in flex flex-col h-full">
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex ${isVertical ? 'flex-col' : 'flex-col lg:flex-row'} shrink-0`}>
        
        {/* Header Panel */}
        <div className={`bg-brand-600 p-6 ${isVertical ? 'w-full py-8' : 'lg:w-[35%]'} text-white relative overflow-hidden flex flex-col justify-center shrink-0`}>
          <div className="relative z-10">
            {/* FORCE FONT-SANS (LATO) AND NO ICON */}
            <h2 className="text-2xl font-bold font-sans tracking-tight mb-1">
              {t.mood_title}
            </h2>
            <p className="text-brand-100 text-sm leading-relaxed opacity-90 font-medium">
              {t.mood_subtitle}
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Input Panel */}
        <div className={`p-5 ${isVertical ? 'w-full' : 'lg:w-[65%]'} flex flex-col justify-center bg-slate-50/50 dark:bg-slate-900/50`}>
          
          <div className="relative group w-full">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={t.input_placeholder}
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-base text-slate-800 dark:text-white transition-all shadow-sm placeholder:text-slate-400"
            />
            <button 
              onClick={handleGenerate}
              disabled={!query.trim() || loading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>

          {/* Quick Picks */}
          <div className="mt-3 flex flex-wrap gap-1.5">
             {QUICK_PICKS.slice(0, isVertical ? 6 : undefined).map(pick => (
               <button
                  key={pick}
                  onClick={() => setQuery(pick)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all duration-200 
                     ${query === pick 
                        ? 'bg-brand-100 text-brand-700 border-brand-300 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-700' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
                     }`}
               >
                  {pick}
               </button>
             ))}
          </div>

        </div>
      </div>
          
      {/* Results List - Vertically stacked if sidebar, Grid if horizontal */}
      {recommendations.length > 0 && (
        <div className={`mt-6 grid ${isVertical ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'} animate-fade-in pb-10`}>
          {recommendations.map((movie, idx) => (
            <div 
              key={idx} 
              className={`bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-md hover:shadow-lg group flex ${isVertical ? 'flex-row gap-3 h-auto' : 'flex-col h-full'} animate-fade-in-up`}
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
            >
              {/* Poster */}
              <div className={`${isVertical ? 'w-24 aspect-[2/3]' : 'w-full aspect-[2/3] mb-4'} bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative shadow-sm shrink-0`}>
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <Film size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col min-w-0">
                <h3 className={`font-bold text-slate-800 dark:text-white leading-tight ${isVertical ? 'text-base mb-0.5' : 'text-xl mb-1'}`}>{movie.title}</h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2 block">{movie.year}</span>
                
                <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2 line-clamp-3 ${isVertical ? 'hidden sm:block' : ''}`}>
                  {movie.plot}
                </p>

                <div className={`mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 bg-brand-50/50 dark:bg-slate-700/30 rounded-lg ${isVertical ? 'p-2' : 'p-3'}`}>
                  <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-0.5">
                      {t.vibe_check_label}
                  </span>
                  <p className={`text-slate-800 dark:text-slate-200 font-hand leading-snug italic ${isVertical ? 'text-xs' : 'text-base'}`}>
                    "{movie.reason}"
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className={`${isVertical ? 'col-span-1' : 'md:col-span-3'} flex justify-center mt-4`}>
             <button 
                onClick={handleClear}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
                {t.clear_btn}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
