import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StickyNote } from './components/StickyNote';
import { AddReviewForm } from './components/AddReviewForm';
import { AuthPage } from './components/AuthPage';
import { Review, UserRole, MovieDetails, GamificationState, User } from './types';
import { LEVEL_MILESTONES, COLOR_VARIANTS } from './constants';
import { generateMotivationalQuote } from './services/geminiService';
import { authService } from './services/authService';
import { Clapperboard, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // --- AUTH STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- APP STATE ---
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('cinenote_theme');
    return saved === 'dark';
  });
  const [quote, setQuote] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Initialize Auth
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoadingAuth(false);
  }, []);

  // Load Reviews when User changes
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`cinenote_reviews_${user.id}`);
      setReviews(saved ? JSON.parse(saved) : []);
    } else {
      setReviews([]);
    }
  }, [user]);

  // Persist Reviews
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cinenote_reviews_${user.id}`, JSON.stringify(reviews));
    }
  }, [reviews, user]);

  // Theme Logic
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cinenote_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cinenote_theme', 'light');
    }
  }, [isDark]);

  // Gamification Logic
  const stats: GamificationState = useMemo(() => {
    const count = reviews.length;
    let currentRole = UserRole.NOVICE;
    let nextCount = 3;

    for (let i = 0; i < LEVEL_MILESTONES.length; i++) {
      if (count >= LEVEL_MILESTONES[i].count) {
        currentRole = LEVEL_MILESTONES[i].role;
        nextCount = LEVEL_MILESTONES[i + 1]?.count || count * 2;
      }
    }

    const prevMilestone = LEVEL_MILESTONES.find(m => m.role === currentRole)?.count || 0;
    const totalNeeded = nextCount - prevMilestone;
    const currentProgress = count - prevMilestone;
    const progressPercentage = Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));

    return {
      role: currentRole,
      nextMilestone: nextCount,
      progress: progressPercentage
    };
  }, [reviews.length]);

  // Derived state for sorting
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.createdAt - a.createdAt 
        : a.createdAt - b.createdAt;
    });
  }, [reviews, sortOrder]);

  // Fetch Quote
  useEffect(() => {
    if (user) {
      generateMotivationalQuote(stats.role).then(setQuote);
    }
  }, [stats.role, user]);

  // Actions
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleAddReview = (movie: MovieDetails, rating: number, content: string) => {
    // Randomly select a color variant from the defined constants
    const randomVariant = COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)];

    const newReview: Review = {
      id: generateId(),
      movieId: generateId(),
      movieDetails: movie,
      userRating: rating,
      content,
      createdAt: Date.now(),
      colorVariant: randomVariant
    };

    setReviews(prev => [newReview, ...prev]);
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Loading State
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-slate-900 text-brand-600">
         <div className="animate-bounce">Loading...</div>
      </div>
    );
  }

  // Unauthenticated View
  if (!user) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-brand-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
           <AuthPage onAuthSuccess={handleLogin} />
           <button 
              onClick={() => setIsDark(!isDark)} 
              className="fixed bottom-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-lg"
           >
             {isDark ? "☀️" : "🌙"}
           </button>
        </div>
      </div>
    );
  }

  // Authenticated View (Main App)
  return (
    <div className="min-h-screen flex flex-col pb-24 bg-brand-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        stats={stats} 
        user={user}
        onLogout={handleLogout}
        reviewCount={reviews.length}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        
        {/* Welcome / Stats Header */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
              {user.username}'s <span className="text-brand-600 dark:text-brand-400">Diary</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium italic">
              {quote ? `"${quote}"` : "Loading wit..."}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-6xl font-black text-slate-200 dark:text-slate-800 leading-none select-none">
              {reviews.length.toString().padStart(2, '0')}
            </span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">
              Films Logged
            </span>
          </div>
        </div>

        {/* Sort Control */}
        {reviews.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-slate-600 transition-all"
            >
              {sortOrder === 'desc' ? (
                <>
                  <span>Newest First</span>
                  <ArrowDownWideNarrow size={16} />
                </>
              ) : (
                <>
                  <span>Oldest First</span>
                  <ArrowUpNarrowWide size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-fade-in">
            <div className="bg-brand-100 dark:bg-brand-900/30 p-4 rounded-full mb-4">
              <Clapperboard className="text-brand-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">No films logged.</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
              Did you really spend your weekend touching grass?
            </p>
          </div>
        )}

        {/* Review Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-6">
          {sortedReviews.map((review, index) => (
            <div 
              key={review.id} 
              className="animate-fade-in-up w-full"
              style={{ animationDelay: `${Math.min(index * 0.07, 1)}s`, animationFillMode: 'both' }}
            >
              <StickyNote 
                review={review} 
                index={index} 
                onDelete={handleDeleteReview} 
              />
            </div>
          ))}
        </div>
      </main>

      <AddReviewForm onAdd={handleAddReview} />
    </div>
  );
}

export default App;