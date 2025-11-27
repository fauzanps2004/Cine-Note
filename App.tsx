
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

const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('cinenote_theme') === 'dark');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('cinenote_language') as Language) || 'id');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) setUser(currentUser);
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`cinenote_reviews_${user.id}`);
      setReviews(saved ? JSON.parse(saved) : []);
    } else {
      setReviews([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem(`cinenote_reviews_${user.id}`, JSON.stringify(reviews));
  }, [reviews, user]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cinenote_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cinenote_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => localStorage.setItem('cinenote_language', language), [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'id' ? 'en' : 'id');

  const stats: GamificationState = useMemo(() => {
    const count = reviews.length;
    let currentRole = UserRole.NOVICE;
    let nextCount = 3;
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

    let currentStreak = 0;
    if (reviews.length > 0) {
      const uniqueDates: string[] = Array.from(new Set(reviews.map(r => new Date(r.createdAt).toDateString())));
      uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
        currentStreak = 1;
        let lastDate = new Date(uniqueDates[0]);
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i]);
          const diffDays = Math.round(Math.abs(lastDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) { currentStreak++; lastDate = prevDate; } else break;
        }
      }
    }
    return { role: currentRole, nextMilestone: nextCount, progress: progressPercentage, streak: currentStreak };
  }, [reviews, language]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
  }, [reviews, sortOrder]);

  const handleLogin = (u: User) => setUser(u);
  const handleLogout = () => { authService.logout(); setUser(null); };
  
  const handleAddReview = (movie: MovieDetails, rating: number, content: string) => {
    const randomVariant = COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)];
    const newReview: Review = { id: generateId(), movieId: generateId(), movieDetails: movie, userRating: rating, content, createdAt: Date.now(), colorVariant: randomVariant };
    setReviews(prev => [newReview, ...prev]);
  };
  
  const handleUpdateReview = (id: string, movie: MovieDetails, rating: number, content: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, movieDetails: movie, userRating: rating, content } : r));
  };
  
  const handleDeleteReview = (id: string) => setReviews(prev => prev.filter(r => r.id !== id));
  
  const handleEditClick = (review: Review) => { setEditingReview(review); setIsAddReviewOpen(true); };
  const handleCloseModal = () => { setIsAddReviewOpen(false); setTimeout(() => setEditingReview(null), 300); };
  const toggleSort = () => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-slate-900"><div className="animate-bounce text-brand-500">Loading...</div></div>;

  if (!user) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-brand-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
           <AuthPage onAuthSuccess={handleLogin} language={language} toggleLanguage={toggleLanguage} />
           <button onClick={() => setIsDark(!isDark)} className="fixed bottom-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-lg">{isDark ? "☀️" : "🌙"}</button>
        </div>
      </div>
    );
  }

  // DASHBOARD LAYOUT
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-brand-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 animate-fade-in">
      
      <Navbar 
        isDark={isDark} toggleTheme={() => setIsDark(!isDark)} stats={stats} user={user} onLogout={handleLogout} reviewCount={reviews.length} language={language} toggleLanguage={toggleLanguage}
      />

      <div className="flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto">
        
        {/* LEFT SIDEBAR (Widgets) - Hidden on mobile, visible on lg screens */}
        <aside className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 overflow-y-auto scrollbar-thin p-6 gap-8">
           <UpcomingBanner language={language} />
           <MoodRecommender language={language} layout="vertical" />
        </aside>

        {/* RIGHT MAIN CONTENT (Diary) */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Main Header (Sticky) */}
          <div className="shrink-0 px-4 sm:px-8 pt-6 pb-2 z-10 bg-brand-50/95 dark:bg-slate-900/95 backdrop-blur-sm">
             {/* Mobile Banner Fallback (Only visible on small screens) */}
             <div className="lg:hidden mb-6">
                <UpcomingBanner language={language} />
                <div className="mt-4"><MoodRecommender language={language} layout="horizontal" /></div>
             </div>

             <div className="flex flex-col sm:flex-row items-end justify-between gap-4 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-2 font-hand">
                    {t.diary_of} <span className="text-brand-600 dark:text-brand-400">{user.username}</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Film size={16} />
                    <span>{reviews.length} {t.films_logged}</span>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={toggleSort} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {sortOrder === 'desc' ? <ArrowDownWideNarrow size={18} /> : <ArrowUpNarrowWide size={18} />}
                    <span className="hidden sm:inline">{sortOrder === 'desc' ? t.sort_newest : t.sort_oldest}</span>
                  </button>
                  <button onClick={() => setIsAddReviewOpen(true)} className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold">
                    <Plus size={18} strokeWidth={3} />
                    {t.add_review_btn}
                  </button>
                </div>
             </div>
             
             {/* Divider */}
             <div className="h-px bg-slate-200 dark:bg-slate-800 w-full mb-2"></div>
          </div>

          {/* Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2 scrollbar-thin">
            {sortedReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
                {sortedReviews.map((review, index) => (
                  <StickyNote 
                    key={review.id} review={review} onDelete={handleDeleteReview} onEdit={handleEditClick} index={index} language={language}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in text-slate-400 dark:text-slate-500 h-full">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Film size={40} className="opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-600 dark:text-slate-300">{t.empty_title}</h3>
                <p className="max-w-md">{t.empty_subtitle}</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <AddReviewForm isOpen={isAddReviewOpen} onClose={handleCloseModal} onAdd={handleAddReview} onUpdate={handleUpdateReview} language={language} initialData={editingReview} />
    </div>
  );
}

export default App;
