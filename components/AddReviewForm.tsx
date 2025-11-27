
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Star, X, ImageOff, ArrowLeft, Film, CheckCircle } from 'lucide-react';
import { searchMovies, getMovieDetails } from '../services/movieService';
import { MovieDetails, MovieSearchResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AddReviewFormProps {
  onAdd: (movie: MovieDetails, rating: number, content: string) => void;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AddReviewForm: React.FC<AddReviewFormProps> = ({ onAdd, isOpen, onClose, language }) => {
  const [step, setStep] = useState<'search' | 'details' | 'review'>('search');
  const [query, setQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null);
  
  const [rating, setRating] = useState(3);
  const [content, setContent] = useState('');
  const [justWatched, setJustWatched] = useState(false);
  
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[language];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        setError('');
        setImgError({});
        try {
          const results = await searchMovies(query);
          setSearchResults(results || []);
        } catch (err) {
           console.error(err);
           setError(t.error_search);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500); // Reduced to 500ms for better responsiveness

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const resetForm = () => {
    setStep('search');
    setQuery('');
    setSearchResults([]);
    setSelectedMovie(null);
    setRating(3);
    setContent('');
    setJustWatched(false);
    setError('');
    setImgError({});
    setShowSuccess(false);
    onClose();
  };

  const handleSelectMovie = async (movie: MovieSearchResult) => {
    if (!movie.imdbID) {
        setError(t.error_imdb_id);
        return;
    }

    setLoading(true);
    setError('');
    try {
        const details = await getMovieDetails(movie.imdbID);
        if (details) {
            setSelectedMovie(details);
            setStep('details');
        } else {
            setError(t.error_fetch_details);
        }
    } catch (err) {
        setError(t.error_fetch_details);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmitReview = () => {
    // Allow submission if content exists OR if "justWatched" is enabled
    if (selectedMovie && (content.trim() || justWatched)) {
      // Add review immediately (send empty string if justWatched)
      onAdd(selectedMovie, rating, justWatched ? "" : content);
      
      // Show success state
      setShowSuccess(true);

      // Close after delay
      setTimeout(() => {
        resetForm();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand-50/50 dark:bg-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {!showSuccess && step !== 'search' && (
              <button 
                onClick={() => {
                    if (step === 'review') setStep('details');
                    else if (step === 'details') setStep('search');
                }}
                className="p-1 -ml-2 mr-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              {showSuccess ? t.saved_title : (
                <>
                  {step === 'search' && t.header_search}
                  {step === 'details' && t.header_details}
                  {step === 'review' && t.header_review}
                </>
              )}
            </h2>
          </div>
          <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {showSuccess ? (
             <div className="flex flex-col items-center justify-center h-full animate-fade-in py-10">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 text-green-600 dark:text-green-400 animate-bounce">
                  <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-hand">
                  {t.saved_msg}
                </h2>
             </div>
          ) : (
            <>
              {/* STEP 1: SEARCH & RESULTS */}
              {step === 'search' && (
                <div className="flex flex-col gap-4 h-full">
                  {/* Search Input */}
                  <div className="relative shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.search_placeholder}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white transition-all"
                      autoFocus
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-brand-500" size={20} />
                        </div>
                    )}
                  </div>
                  
                  {error && <p className="text-red-500 text-sm text-center shrink-0">{error}</p>}

                  {/* Results List */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {!loading && searchResults.length === 0 && query.trim() && (
                        <div className="text-center text-slate-400 py-8 flex flex-col items-center">
                           <Film className="mb-2 opacity-50" size={32} />
                           <p className="text-sm">{t.searching} "{query}"...</p>
                        </div>
                    )}
                    
                    {searchResults.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {searchResults.map((movie, idx) => (
                                <button
                                    key={`${movie.imdbID}-${idx}`}
                                    onClick={() => handleSelectMovie(movie)}
                                    className="flex flex-col text-left group relative bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-800 w-full relative overflow-hidden">
                                        {!imgError[`${movie.imdbID}-${idx}`] && movie.posterUrl ? (
                                            <img 
                                                src={movie.posterUrl} 
                                                alt={movie.title}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={() => setImgError(prev => ({ ...prev, [`${movie.imdbID}-${idx}`]: true }))}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-2 bg-slate-100 dark:bg-slate-800">
                                                <Film size={24} className="mb-1 opacity-50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                            <span className="text-white text-xs font-bold truncate w-full">{movie.year}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: CONFIRM DETAILS */}
              {step === 'details' && selectedMovie && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-brand-50 dark:bg-slate-900 p-4 rounded-xl border border-brand-100 dark:border-slate-700">
                    <div className="flex gap-4">
                      {/* Poster Preview */}
                      <div className="w-24 h-36 shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm">
                        {selectedMovie.posterUrl ? (
                          <img 
                            src={selectedMovie.posterUrl} 
                            alt={selectedMovie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                            <ImageOff size={24} />
                            <span className="text-[10px]">No Poster</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                          <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 leading-tight">{selectedMovie.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-brand-600/80 dark:text-brand-400 mt-1">
                            <span>{selectedMovie.year}</span>
                            <span>•</span>
                            <span>{selectedMovie.director}</span>
                          </div>
                          {selectedMovie.imdbRating && (
                             <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                                <span>★</span>
                                <span>{selectedMovie.imdbRating}/10</span>
                             </div>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {selectedMovie.genre.slice(0, 3).map(g => (
                              <span key={g} className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-brand-200 dark:border-slate-600 text-slate-500">
                                {g}
                              </span>
                            ))}
                          </div>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-t border-brand-200 dark:border-slate-700 pt-3">
                      "{selectedMovie.plot}"
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('review')}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-brand-500/20"
                  >
                    {t.confirm_btn}
                  </button>
                </div>
              )}

              {/* STEP 3: WRITE REVIEW */}
              {step === 'review' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col items-center mb-4">
                    <label className="text-sm font-medium text-slate-500 mb-2">{t.rating_label}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        >
                          <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 2} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="block text-sm font-medium text-slate-500">{t.review_label}</label>
                       
                       {/* Just Watched Toggle */}
                       <div 
                         onClick={() => setJustWatched(!justWatched)}
                         className="flex items-center gap-2 cursor-pointer select-none group"
                       >
                          <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${justWatched ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${justWatched ? 'translate-x-5' : 'translate-x-0'}`} />
                          </div>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {t.just_watched_toggle}
                          </span>
                       </div>
                    </div>
                    
                    <div className="relative">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={justWatched}
                        placeholder={t.review_placeholder}
                        className={`w-full h-32 p-3 bg-yellow-50 dark:bg-slate-900 border-l-4 border-l-yellow-400 border-t border-r border-b border-slate-200 dark:border-slate-700 rounded-r-lg focus:ring-0 focus:border-l-yellow-500 dark:text-slate-200 font-hand text-base resize-none transition-opacity duration-200 ${justWatched ? 'opacity-30 cursor-not-allowed select-none' : 'opacity-100'}`}
                        autoFocus={!justWatched}
                      />
                      {justWatched && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <span className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-200 dark:border-slate-600">
                             {t.just_watched_overlay}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={!justWatched && !content.trim()}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 mt-2 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {t.save_btn}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
