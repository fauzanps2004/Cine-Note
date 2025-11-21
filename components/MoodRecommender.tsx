
import React, { useState } from 'react';
import { Sparkles, Loader2, Film, X } from 'lucide-react';
import { GET_MOODS, GET_VIBES, TRANSLATIONS } from '../constants';
import { getMovieRecommendations } from '../services/geminiService';
import { searchMovies } from '../services/movieService';
import { MovieRecommendation, Language } from '../types';

interface MoodRecommenderProps {
  language: Language;
}

export const MoodRecommender: React.FC<MoodRecommenderProps> = ({ language }) => {
  const [moodInput, setMoodInput] = useState<string>('');
  const [vibeInput, setVibeInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

  const t = TRANSLATIONS[language];
  const MOODS = GET_MOODS(language);
  const VIBES = GET_VIBES(language);

  const handleGenerate = async () => {
    if (!moodInput.trim() || !vibeInput.trim()) return;

    setLoading(true);
    setRecommendations([]);

    try {
      // 1. Get suggestions from Gemini
      const aiSuggestions = await getMovieRecommendations(moodInput, vibeInput, language);

      // 2. Enrich with real posters from OMDb
      const enrichedResults = await Promise.all(
        aiSuggestions.map(async (item) => {
          try {
            // Search OMDb for the specific title to get the poster
            const searchResults = await searchMovies(item.title);
            // Find best match (usually first one)
            const match = searchResults.find(r => r.title.toLowerCase() === item.title.toLowerCase()) || searchResults[0];
            
            return {
              ...item,
              posterUrl: match?.posterUrl || null,
              imdbID: match?.imdbID
            };
          } catch (e) {
            return item; // Fallback to just text if OMDb fails
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
    setMoodInput('');
    setVibeInput('');
    setRecommendations([]);
  };

  return (
    <div className="w-full mt-20 mb-10 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="bg-brand-600 p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2 font-hand tracking-wide">
              <Sparkles className="text-yellow-300" />
              {t.mood_title}
            </h2>
            <p className="text-brand-100 text-sm mt-1 opacity-90">
              {t.mood_subtitle}
            </p>
          </div>
          {/* Decorative BG */}
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
             <Film size={150} />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Mood Input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.mood_label}
              </label>
              <input 
                type="text"
                value={moodInput}
                onChange={(e) => setMoodInput(e.target.value)}
                placeholder={t.mood_placeholder}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all mb-3"
              />
              
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => setMoodInput(mood)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-300 ${moodInput === mood ? 'bg-brand-100 text-brand-700 border-brand-300' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe Input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {t.vibe_label}
              </label>
               <input 
                type="text"
                value={vibeInput}
                onChange={(e) => setVibeInput(e.target.value)}
                placeholder={t.vibe_placeholder}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none dark:text-white transition-all mb-3"
              />
              
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {VIBES.map(vibe => (
                  <button
                    key={vibe}
                    onClick={() => setVibeInput(vibe)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-purple-300 ${vibeInput === vibe ? 'bg-purple-100 text-purple-700 border-purple-300' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-center mb-8 gap-4">
             {recommendations.length > 0 && (
                <button 
                  onClick={handleClear}
                  className="px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                   {t.clear_btn}
                </button>
             )}
            <button
              onClick={handleGenerate}
              disabled={!moodInput.trim() || !vibeInput.trim() || loading}
              className="group relative px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-500/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              <span>{t.generate_btn}</span>
            </button>
          </div>

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((movie, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 transition-colors group flex flex-col h-full animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'both' }}
                >
                  <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden relative shadow-sm shrink-0">
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <Film size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight text-lg mb-0.5">{movie.title}</h3>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">{movie.year}</span>
                    
                    {/* Plot Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                      {movie.plot}
                    </p>

                    {/* Vibe Check / Reason */}
                    <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-2 rounded-lg">
                      <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block mb-1">
                          {t.vibe_check_label}
                      </span>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-hand leading-snug italic">
                        "{movie.reason}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
