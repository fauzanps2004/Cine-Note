
import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StickyNote } from './components/StickyNote';
import { AddReviewForm } from './components/AddReviewForm';
import { AuthPage } from './components/AuthPage';
import { MoodRecommender } from './components/MoodRecommender';
import { UpcomingBanner } from './components/UpcomingBanner';
import { Review, UserRole, MovieDetails, GamificationState, User, Language } from './types';
import { GET_LEVEL_MILESTONES, COLOR_VARIANTS, TRANSLATIONS } from './constants';
import { authService } from './services/authService';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Plus } from 'lucide-react';

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
  
  // LANGUAGE STATE
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('cinenote_language');
    return (saved === 'id' || saved === 'en') ? saved : 'id';
  });

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);

  const t = TRANSLATIONS[language];

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

  // Language Logic
  useEffect(() => {
    localStorage.setItem('cinenote_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'id' ? 'en' : 'id');
  };

  // Gamification Logic (Rank & Streak)
  const stats: GamificationState = useMemo(() => {
    // 1. Calculate Rank
    const count = reviews.length;
    let currentRole = UserRole.NOVICE;
    let nextCount = 3;

    // Get milestones for current language (roles are same enum, descriptions differ, but counts are logic)
    const MILESTONES = GET_LEVEL_MILESTONES(language);

    for (let i = 0; i < MILESTONES.length; i++) {
      if (count >= MILESTONES[i].count) {
        currentRole = MILESTONES[i].role;
        nextCount = MILESTONES[i + 1]?.count || count * 2;
      }
    }

    const prevMilestone = MILESTONES.find(m => m.role === currentRole)?.count || 0;
    const totalNeeded = nextCount - prevMilestone;
    const currentProgress = count - prevMilestone;
    const progressPercentage = Math.min(100, Math.max(0, (currentProgress / totalNeeded) * 100));

    // 2. Calculate Streak
    let currentStreak = 0;
    if (reviews.length > 0) {
      // Get unique dates (formatted as local date string to ignore time)
      const uniqueDates: string[] = Array.from(new Set(reviews.map(r => new Date(r.createdAt).toDateString())));
      
      // Sort descending (newest first)
      uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      // If the most recent review wasn't today or yesterday, streak is broken
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let lastDate = new Date(uniqueDates[0]);

        // Check backwards for consecutive days
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffTime = Math.abs(lastDate.getTime() - prevDate.getTime());
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            currentStreak++;
            lastDate = prevDate;
          } else {
            break; // Gap found, stop counting
          }
        }
      }
    }

    return {
      role: currentRole,
      nextMilestone: nextCount,
      progress: progressPercentage,
      streak: currentStreak
    };
  }, [reviews, language]);

  // Derived state for sorting
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      return sortOrder === 'desc' 
        ? b.createdAt - a.createdAt 
        : a.createdAt - b.createdAt;
    });
  }, [reviews, sortOrder]);

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
           <AuthPage onAuthSuccess={handleLogin} language={language} toggleLanguage={toggleLanguage} />
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
    <div className="min-h-screen flex flex-col pb-24 bg-brand-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 animate-fade-in">
      
      <Navbar 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        stats={stats} 
        user={user}
        onLogout={handleLogout}
        reviewCount={reviews.length}
        language={language}
        toggleLanguage={toggleLanguage}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8">
        
        {/* Upcoming Banner Section (Navigasi Banner Style) */}
        {/* Banner has its own internal animations */}
        <UpcomingBanner language={language} />

        {/* Welcome / Stats Header */}
        <div 
          className="mb-10 text-center sm:text-left flex flex-col sm:flex-row items-end justify-between gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          <div className="w-full sm:w-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
              {t.diary_of} <span className="text-brand-600 dark:text-brand-400">{user.username}</span>
            </h1>
            
            {/* Add Review Button (Moved to Top) */}
            <button 
              onClick={() => setIsAddReviewOpen(true)}
              className="mt-4 inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-brand-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Plus size={20} />
              <span>{t.add_review_btn}</span>
            </button>
          </div>
          
          <div className="text-right hidden sm:block">
            <span className="text-6xl font-black text-slate-200 dark:text-slate-800 leading-none select-none">
              {reviews.length.toString().padStart(2, '0')}
            </span>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">
              {t.films_logged}
            </span>
          </div>
        </div>

        {/* Sort Control */}
        {reviews.length > 0 && (
          <div 
            className="flex justify-end mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <button
              onClick={toggleSort}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-slate-600 transition-all"
            >
              {sortOrder === 'desc' ? (
                <>
                  <span>{t.sort_newest}</span>
                  <ArrowDownWideNarrow size={16} />
                </>
              ) : (
                <>
                  <span>{t.sort_oldest}</span>
                  <ArrowUpNarrowWide size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t.empty_title}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
              {t.empty_subtitle}
            </p>
          </div>
        )}

        {/* Review Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-6">
          {sortedReviews.map((review, index) => (
            <div 
              key={review.id} 
              className="animate-fade-in-up w-full"
              // Add a base delay of 0.3s so items appear after the header
              style={{ animationDelay: `${(Math.min(index * 0.07, 1)) + 0.3}s`, animationFillMode: 'both' }}
            >
              <StickyNote 
                review={review} 
                index={index} 
                onDelete={handleDeleteReview} 
                language={language}
              />
            </div>
          ))}
        </div>

        {/* AI RECOMMENDATION SECTION */}
        <MoodRecommender language={language} />

      </main>

      <AddReviewForm 
        onAdd={handleAddReview} 
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        language={language}
      />
    </div>
  );
}

export default App;
