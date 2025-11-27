
import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Film, Search, ArrowRight } from 'lucide-react';
import { GET_QUICK_PICKS, TRANSLATIONS } from '../constants';
import { getMovieRecommendations } from '../services/geminiService';
import { searchMovies } from '../services/movieService';
import { MovieRecommendation, Language } from '../types';

interface MoodRecommenderProps {
  language: Language;
}

export const MoodRecommender: React.FC<MoodRecommenderProps> = ({ language }) => {
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
    }
  };

  const handleClear = () => {
    setQuery('');
    setRecommendations([]);
  };

  return (
    <div className="w-full mt-10 mb-20 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Panel: Header & Branding (Horizontal layout) */}
        <div className="bg-brand-600 p-8 lg:w-[35%] text-white relative overflow-hidden flex flex-col justify-center shrink-0">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold flex items-center gap-3 font-hand tracking-wide mb-2">
              <Sparkles className="text-yellow-300 w-8 h-8" />
              {t.mood_title}
            </h2>
            <p className="text-brand-100 text-base leading-relaxed opacity-90 font-medium">
              {t.mood_subtitle}
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-10 -left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>

        {/* Right Panel: Input Area */}
        <div className="p-6 sm:p-8 lg:w-[65%] flex flex-col justify-center bg-slate-50/50 dark:bg-slate-900/50">
          
          <div className="relative group w-full">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={t.input_placeholder}
              className="w-full pl-6 pr-16 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none text-lg sm:text-xl text-slate-800 dark:text-white transition-all shadow-sm placeholder:text-slate-400"
            />
            <button 
              onClick={handleGenerate}
              disabled={!query.trim() || loading}
              className="absolute right-3 top-3 bottom-3 aspect-square bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <ArrowRight size={24} />}
            </button>
          </div>

          {/* Quick Picks / Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
             {QUICK_PICKS.map(pick => (
               <button
                  key={pick}
                  onClick={() => setQuery(pick)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200 
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
          
      {/* Results Grid - Appears below the bar */}
      {recommendations.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {recommendations.map((movie, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-lg hover:shadow-xl group flex flex-col h-full animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
            >
              <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-800 rounded-xl mb-4 overflow-hidden relative shadow-sm shrink-0">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <Film size={32} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-xl mb-1">{movie.title}</h3>
                <span className="text-sm font-mono text-slate-500 dark:text-slate-400 mb-3 block">{movie.year}</span>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {movie.plot}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 bg-brand-50/50 dark:bg-slate-700/30 p-3 rounded-xl">
                  <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
                      {t.vibe_check_label}
                  </span>
                  <p className="text-base text-slate-800 dark:text-slate-200 font-hand leading-snug italic">
                    "{movie.reason}"
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="md:col-span-3 flex justify-center mt-8">
             <button 
                onClick={handleClear}
                className="px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
                {t.clear_btn}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
