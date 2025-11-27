
import React, { useState } from 'react';
import { Moon, Sun, LogOut, Video, Languages, Film } from 'lucide-react';
import { GamificationState, User as UserType, UserRole, Language } from '../types';
import { RankModal } from './RankModal';
import { RANK_STYLES, TRANSLATIONS } from '../constants';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  stats: GamificationState;
  user: UserType;
  onLogout: () => void;
  reviewCount?: number;
  language: Language;
  toggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  isDark, 
  toggleTheme, 
  stats, 
  user, 
  onLogout, 
  reviewCount = 0,
  language,
  toggleLanguage
}) => {
  const [showRankModal, setShowRankModal] = useState(false);
  const t = TRANSLATIONS[language];
  
  const RankIcon = RANK_STYLES[stats.role]?.icon || Film;
  const rankStyle = RANK_STYLES[stats.role] || RANK_STYLES[UserRole.NOVICE];

  const tooltipClasses = "absolute top-full mt-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 font-sans font-bold tracking-wide";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center">
        <div className="w-full max-w-[1920px] mx-auto px-6">
          <div className="flex justify-between items-center">
            
            {/* Logo - Text Only */}
            <div className="flex items-center shrink-0 w-[380px] xl:w-[420px]">
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white font-sans flex items-center gap-1 select-none">
                Cine<span className="text-brand-600 dark:text-brand-500">Note</span>
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Gamification Group */}
              <div className="flex items-center gap-3 mr-4 pl-4 border-l border-slate-100 dark:border-slate-800">
                {/* Streak */}
                <div 
                  className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-200 dark:border-orange-800/30 cursor-help relative group"
                >
                  <Video size={14} className="fill-orange-500 text-orange-600" />
                  <span className="font-bold text-xs">{stats.streak}</span>
                  <div className={tooltipClasses}>{t.streak_tooltip(stats.streak)}</div>
                </div>

                {/* Rank Badge */}
                <button 
                  onClick={() => setShowRankModal(true)}
                  className="group relative flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white bg-gradient-to-b ${rankStyle.gradient} shadow-sm`}
                  >
                    <RankIcon size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{stats.role}</span>
                  <div className={tooltipClasses}>{t.rank_tooltip}</div>
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleLanguage}
                  className="relative group w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-xs font-black">{language.toUpperCase()}</span>
                  <div className={tooltipClasses}>
                    {language === 'id' ? 'Switch to English' : 'Ganti Bahasa Indonesia'}
                  </div>
                </button>

                <button
                  onClick={toggleTheme}
                  className="relative group w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  <div className={tooltipClasses}>
                    {isDark ? t.theme_light : t.theme_dark}
                  </div>
                </button>
                
                <button
                  onClick={onLogout}
                  className="relative group w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} />
                  <div className={tooltipClasses}>{t.logout_tooltip}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <RankModal 
        isOpen={showRankModal} 
        onClose={() => setShowRankModal(false)} 
        stats={stats} 
        reviewCount={reviewCount}
        language={language}
      />
    </>
  );
};
