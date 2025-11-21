import { UserRole, Review } from './types';

export const STICKY_COLORS = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  cyan: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800',
  sky: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
};

export const COLOR_VARIANTS = Object.keys(STICKY_COLORS) as Review['colorVariant'][];

export const STICKY_ROTATIONS = [
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  '-rotate-2',
  'rotate-0'
];

export const LEVEL_MILESTONES = [
  { count: 0, role: UserRole.NOVICE, description: "You watched a movie once. Cute." },
  { count: 3, role: UserRole.ENTHUSIAST, description: "You know that movies exist outside of Marvel." },
  { count: 6, role: UserRole.BUFF, description: "You've started using words like 'cinematography'." },
  { count: 10, role: UserRole.CINEPHILE, description: "You own a physical copy of a Criterion movie." },
  { count: 20, role: UserRole.CRITIC, description: "You hate everything. Congratulations." },
];