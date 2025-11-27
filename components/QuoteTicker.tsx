import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { MOVIE_QUOTES } from '../constants';

export const QuoteTicker: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsVisible(false);

      // Wait for fade out, then swap text and fade in
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % MOVIE_QUOTES.length);
        setIsVisible(true);
      }, 500); // 500ms matches the duration-500 class

    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = MOVIE_QUOTES[index];

  return (
    <div className="hidden lg:flex items-center justify-center max-w-md w-full px-4">
      <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-sm w-full backdrop-blur-sm">
        <Quote size={14} className="text-brand-500 shrink-0 rotate-180 fill-current" />
        
        <div className="flex-1 overflow-hidden relative h-5">
          <div 
            className={`
              absolute inset-0 flex items-center gap-2 transition-opacity duration-500 ease-in-out
              ${isVisible ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate italic">
              "{currentQuote.text}"
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wide">
              — {currentQuote.movie}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};