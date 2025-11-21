import React, { useState } from 'react';
import { Film, Moon, Sun, LogOut, Settings, Flame } from 'lucide-react';
import { GamificationState, User as UserType, UserRole } from '../types';
import { RankModal } from './RankModal';
import { RANK_STYLES } from '../constants';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  stats: GamificationState;
  user: UserType;
  onLogout: () => void;
  reviewCount?: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  isDark, 
  toggleTheme, 
  stats, 
  user, 
  onLogout, 
  reviewCount = 0,
  onOpenSettings
}) => {
  const [showRankModal, setShowRankModal] = useState(false);
  
  const RankIcon = RANK_STYLES[stats.role]?.icon || Film;
  const rankStyle = RANK_STYLES[stats.role] || RANK_STYLES[UserRole.NOVICE];

  // Common tooltip classes
  const tooltipClasses = "absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none z-50 font-sans font-medium tracking-wide";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg shadow-brand-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                <Film size={26} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white hidden sm:block font-hand">
                Cine<span className="text-brand-500">Note</span>
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
              
              {/* CINE STREAK: 3D Sticker Style */}
              <div 
                 className="flex items-center gap-1.5 bg-gradient-to-b from-orange-400 to-red-500 text-white px-3 py-1.5 rounded-xl border-2 border-white dark:border-slate-700 transform hover:-translate-y-0.5 transition-transform cursor-help relative group"
                 style={{ boxShadow: '0 3px 0 rgb(194,65,12)' }}
              >
                <Flame size={18} fill="currentColor" className="text-yellow-200 animate-pulse" />
                <span className="font-black font-sans text-sm">{stats.streak}</span>
                
                {/* Tooltip */}
                <div className={tooltipClasses}>
                   {stats.streak > 0 ? `${stats.streak} Day Streak!` : "Start a streak today!"}
                </div>
              </div>

              {/* RANK BADGE: 3D Sticker Style */}
              <button 
                onClick={() => setShowRankModal(true)}
                className={`
                  group relative flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border-2 border-white dark:border-slate-700 
                  bg-gradient-to-b ${rankStyle.gradient} text-white
                  transform hover:-translate-y-0.5 transition-transform
                `}
                style={{ boxShadow: `0 3px 0 ${rankStyle.shadow}` }}
              >
                <div className="p-1 bg-white/20 rounded-lg">
                  <RankIcon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Rank</span>
                  <span className="text-xs font-black tracking-wide">{stats.role}</span>
                </div>
                
                {/* Progress hint Tooltip */}
                <div className={tooltipClasses}>
                   View Rank Progress
                </div>
              </button>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

              {/* User & Theme */}
              <div className="flex items-center gap-3">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Director</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{user.username}</span>
                 </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="relative group p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors focus:outline-none"
                  aria-label="Toggle Dark Mode"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  <div className={tooltipClasses}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </button>
                
                {/* Settings */}
                <button
                  onClick={onOpenSettings}
                  className="relative group p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                >
                  <Settings size={20} />
                  <div className={tooltipClasses}>
                    API Settings
                  </div>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="relative group p-2.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <LogOut size={20} />
                  <div className={tooltipClasses}>
                    Log Out
                  </div>
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
      />
    </>
  );
};