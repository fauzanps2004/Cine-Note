import React from 'react';
import { X, Award, CheckCircle2, Circle, Lock } from 'lucide-react';
import { LEVEL_MILESTONES } from '../constants';
import { GamificationState } from '../types';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GamificationState;
  reviewCount: number;
}

export const RankModal: React.FC<RankModalProps> = ({ isOpen, onClose, stats, reviewCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-brand-50/50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-600 dark:text-yellow-400">
                <Award size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">Cinephile Ranks</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Your journey to pretentiousness</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
                {LEVEL_MILESTONES.map((milestone, idx) => {
                    const isUnlocked = reviewCount >= milestone.count;
                    const isCurrent = stats.role === milestone.role;
                    const isNext = !isUnlocked && reviewCount < milestone.count && (idx === 0 || reviewCount >= LEVEL_MILESTONES[idx-1].count);

                    return (
                        <div 
                            key={milestone.role}
                            className={`relative flex gap-4 p-4 rounded-xl border transition-all ${
                                isCurrent 
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 ring-1 ring-brand-500' 
                                    : isUnlocked 
                                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'
                                        : 'bg-transparent border-slate-100 dark:border-slate-800 opacity-50'
                            }`}
                        >
                            <div className="shrink-0 mt-1">
                                {isUnlocked ? (
                                    <CheckCircle2 className="text-green-500" size={20} />
                                ) : isNext ? (
                                    <Circle className="text-brand-500 animate-pulse" size={20} />
                                ) : (
                                    <Lock className="text-slate-300 dark:text-slate-600" size={20} />
                                )}
                            </div>
                            <div>
                                <div className="flex items-baseline justify-between mb-1">
                                    <h3 className={`font-bold ${isCurrent ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {milestone.role}
                                    </h3>
                                    <span className="text-xs font-mono text-slate-400">
                                        {milestone.count} Films
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-snug">
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
                    ? `${stats.nextMilestone - reviewCount} more films to reach next rank`
                    : "You have reached the peak. Go touch grass."}
            </p>
        </div>
      </div>
    </div>
  );
};