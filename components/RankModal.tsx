
import React, { useState } from 'react';
import { X, CheckCircle2, Lock } from 'lucide-react';
import { GET_LEVEL_MILESTONES, RANK_STYLES, TRANSLATIONS } from '../constants';
import { GamificationState, Language } from '../types';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GamificationState;
  reviewCount: number;
  language: Language;
}

export const RankModal: React.FC<RankModalProps> = ({ isOpen, onClose, stats, reviewCount, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const MILESTONES = GET_LEVEL_MILESTONES(language);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand-50/50 dark:bg-slate-800">
          <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{t.rank_modal_title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.rank_modal_subtitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
            <div className="space-y-4">
                {MILESTONES.map((milestone, idx) => {
                    const isUnlocked = reviewCount >= milestone.count;
                    const isCurrent = stats.role === milestone.role;
                    const style = RANK_STYLES[milestone.role];
                    const Icon = style.icon;

                    return (
                        <div 
                            key={milestone.role}
                            className={`relative flex items-center gap-4 p-3 rounded-2xl transition-all ${
                                isCurrent 
                                    ? 'bg-slate-50 dark:bg-white/5 border-2 border-brand-500' 
                                    : isUnlocked 
                                        ? 'opacity-100'
                                        : 'opacity-40 grayscale'
                            }`}
                        >
                           {/* Sticker Icon */}
                            <div 
                                className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-b ${style.gradient} border-2 border-white dark:border-slate-600`}
                                style={{ boxShadow: `0 3px 0 ${style.shadow}` }}
                            >
                                <Icon size={24} strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className={`font-bold truncate ${isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {milestone.role}
                                    </h3>
                                    {isUnlocked && <CheckCircle2 size={16} className="text-green-500 shrink-0" />}
                                    {!isUnlocked && <Lock size={14} className="text-slate-400 shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                                    {milestone.count} {t.films_count}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                    {milestone.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-500">
                {stats.nextMilestone - reviewCount > 0 
                    ? t.next_milestone(stats.nextMilestone - reviewCount)
                    : t.all_unlocked}
            </p>
        </div>
      </div>
    </div>
  );
};
