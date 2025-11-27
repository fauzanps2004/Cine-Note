
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
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Plus, Film } from 'lucide-react';

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
  const [editingReview, setEditingReview] = useState<Review | null>(null);

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

  const handleUpdateReview = (id: string, movie: MovieDetails, rating: number, content: string) => {
    setReviews(prev => prev.map(review => {
      if (review.id === id) {
        return {
          ...review,
          movieDetails: movie, // Usually movie doesn't change during edit, but passed for consistency
          userRating: rating,
          content: content
        };
      }
      return review;
    }));
  };

  const handleDeleteReview = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
    setIsAddReviewOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddReviewOpen(false);
    // Clear editing review after a short delay so modal animation finishes without data jump
    setTimeout(() => setEditingReview(null), 300);
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
          <div>
             <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2 font-hand">
               {t.diary_of} <span className="text-brand-600 dark:text-brand-400">{user.username}</span>
             </h1>
             <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2">
               <Film size={16} />
               <span>{reviews.length} {t.films_logged}</span>
             </p>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={toggleSort}
               className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
             >
               {sortOrder === 'desc' ? <ArrowDownWideNarrow size={18} /> : <ArrowUpNarrowWide size={18} />}
               {sortOrder === 'desc' ? t.sort_newest : t.sort_oldest}
             </button>
             
             <button 
               onClick={() => setIsAddReviewOpen(true)}
               className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold"
             >
               <Plus size={18} strokeWidth={3} />
               {t.add_review_btn}
             </button>
          </div>
        </div>

        {/* Mood Recommender */}
        <MoodRecommender language={language} />

        {/* REVIEWS GRID */}
        {sortedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedReviews.map((review, index) => (
              <StickyNote 
                key={review.id} 
                review={review} 
                onDelete={handleDeleteReview}
                onEdit={handleEditClick}
                index={index}
                language={language}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in text-slate-400 dark:text-slate-500">
             <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Film size={40} className="opacity-50" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-slate-600 dark:text-slate-300">{t.empty_title}</h3>
             <p className="max-w-md">{t.empty_subtitle}</p>
             <button 
               onClick={() => setIsAddReviewOpen(true)}
               className="mt-6 text-brand-600 dark:text-brand-400 font-bold hover:underline"
             >
               {t.add_review_btn}
             </button>
          </div>
        )}

      </main>

      {/* Add/Edit Modal */}
      <AddReviewForm 
        isOpen={isAddReviewOpen} 
        onClose={handleCloseModal} 
        onAdd={handleAddReview}
        onUpdate={handleUpdateReview}
        language={language}
        initialData={editingReview}
      />

    </div>
  );
}

export default App;
