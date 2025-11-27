
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
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Plus, Film, Sparkles, LayoutDashboard, Loader2, BookOpen, Compass } from 'lucide-react';

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
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'diary' | 'explore'>('diary');

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

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin text-brand-500"><Loader2 /></div></div>;

  if (!user) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
           <AuthPage onAuthSuccess={handleLogin} language={language} toggleLanguage={toggleLanguage} />
           <button onClick={() => setIsDark(!isDark)} className="fixed bottom-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-700">{isDark ? "☀️" : "🌙"}</button>
        </div>
      </div>
    );
  }

  // DASHBOARD LAYOUT (Bento Box Style)
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 animate-fade-in font-sans">
      
      <Navbar 
        isDark={isDark} toggleTheme={() => setIsDark(!isDark)} stats={stats} user={user} onLogout={handleLogout} reviewCount={reviews.length} language={language} toggleLanguage={toggleLanguage}
      />

      <div className="flex-1 flex overflow-hidden w-full max-w-[1920px] mx-auto">
        
        {/* LEFT SIDEBAR (Discovery) - DESKTOP ONLY */}
        <aside className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto scrollbar-thin z-10">
           <div className="p-6 flex flex-col gap-8">
              
              {/* Widget: Upcoming */}
              <section>
                 <div className="flex items-center gap-2 mb-4 px-1">
                    <Sparkles size={16} className="text-brand-500" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.upcoming_title}</h3>
                 </div>
                 <UpcomingBanner language={language} />
              </section>

              {/* Widget: Mood */}
              <section>
                 <div className="flex items-center gap-2 mb-4 px-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.mood_title}</h3>
                 </div>
                 <MoodRecommender language={language} layout="vertical" />
              </section>

           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative bg-slate-50/50 dark:bg-slate-950">
          
          {/* CONTENT SWITCHER FOR MOBILE */}
          
          {/* 1. DIARY TAB (Default Mobile & Desktop) */}
          <div className={`flex-col h-full ${activeMobileTab === 'diary' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Header */}
            <div className="shrink-0 px-6 sm:px-8 py-6 z-10 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
               <div className="flex flex-col sm:flex-row items-end justify-between gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
                       {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        {t.diary_of} <span className="text-brand-600 dark:text-brand-400">{user.username}</span>
                      </h1>
                      <div className="flex items-center gap-4 mt-2">
                         <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <LayoutDashboard size={14} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{reviews.length} {t.films_logged}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={toggleSort} 
                      className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {sortOrder === 'desc' ? <ArrowDownWideNarrow size={18} /> : <ArrowUpNarrowWide size={18} />}
                      <span className="inline">{sortOrder === 'desc' ? t.sort_newest : t.sort_oldest}</span>
                    </button>
                    {/* Desktop Add Button */}
                    <button 
                      onClick={() => setIsAddReviewOpen(true)} 
                      className="hidden sm:flex flex-1 sm:flex-none justify-center items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm font-bold"
                    >
                      <Plus size={18} strokeWidth={3} />
                      {t.add_review_btn}
                    </button>
                  </div>
               </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 scrollbar-thin pb-24 lg:pb-8">
              {sortedReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {sortedReviews.map((review, index) => (
                    <StickyNote 
                      key={review.id} review={review} onDelete={handleDeleteReview} onEdit={handleEditClick} index={index} language={language}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in text-slate-400 dark:text-slate-500">
                  <div className="w-24 h-24 mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shadow-inner">
                      <Film size={40} className="opacity-30" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-200">{t.empty_title}</h3>
                  <p className="max-w-md text-sm">{t.empty_subtitle}</p>
                  <button 
                    onClick={() => setIsAddReviewOpen(true)}
                    className="mt-6 text-brand-600 hover:text-brand-700 font-bold text-sm hover:underline"
                  >
                    {t.add_review_btn}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. EXPLORE TAB (Mobile Only) */}
          <div className={`flex-col h-full overflow-y-auto pb-24 px-6 pt-6 ${activeMobileTab === 'explore' ? 'flex lg:hidden' : 'hidden'}`}>
             <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">Explore</h1>
             <div className="space-y-8">
                <UpcomingBanner language={language} />
                <MoodRecommender language={language} layout="vertical" />
             </div>
          </div>

        </main>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (Visible on Diary tab) */}
      {activeMobileTab === 'diary' && (
        <button
          onClick={() => setIsAddReviewOpen(true)}
          className="lg:hidden fixed bottom-20 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:bg-brand-700 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50 pb-safe">
         <button 
            onClick={() => setActiveMobileTab('diary')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeMobileTab === 'diary' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}
         >
            <BookOpen size={20} strokeWidth={activeMobileTab === 'diary' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Diari</span>
         </button>
         <button 
            onClick={() => setActiveMobileTab('explore')}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeMobileTab === 'explore' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}
         >
            <Compass size={20} strokeWidth={activeMobileTab === 'explore' ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Eksplor</span>
         </button>
      </div>

      <AddReviewForm isOpen={isAddReviewOpen} onClose={handleCloseModal} onAdd={handleAddReview} onUpdate={handleUpdateReview} language={language} initialData={editingReview} />
    </div>
  );
}

export default App;
