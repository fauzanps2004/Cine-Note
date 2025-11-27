
import React, { useState, useEffect } from 'react';
import { Loader2, Lock, User as UserIcon, Plus, X, Languages } from 'lucide-react';
import { authService } from '../services/authService';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  language: Language;
  toggleLanguage: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, language, toggleLanguage }) => {
  const [savedAccounts, setSavedAccounts] = useState<User[]>([]);
  const [view, setView] = useState<'profiles' | 'login'>('login'); // 'profiles' or 'login'
  const [isLoginMode, setIsLoginMode] = useState(true); // For the form: Login vs Signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const t = TRANSLATIONS[language];

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Initialize
  useEffect(() => {
    const accounts = authService.getSavedAccounts();
    setSavedAccounts(accounts);
    if (accounts.length > 0) {
      setView('profiles');
    }
  }, []);

  const handleProfileClick = async (user: User) => {
    if (isEditing) return;
    setLoading(true);
    try {
      await authService.quickLogin(user);
      onAuthSuccess(user);
    } catch (e) {
      setError(t.login_failed);
      setLoading(false);
    }
  };

  const handleRemoveProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    authService.removeSavedAccount(userId);
    setSavedAccounts(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isLoginMode) {
        user = await authService.login(formData.username, formData.password);
      } else {
        user = await authService.signup(formData.username, formData.password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-brand-50 dark:bg-slate-900">
      
      {/* Language Toggle (Top Right) */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 px-3"
      >
        <Languages size={16} />
        <span className="text-xs font-bold">{language.toUpperCase()}</span>
      </button>

      {/* Minimalist Brand (Text Only) */}
      <div className="flex items-center mb-10 animate-fade-in">
        <span className="text-4xl font-bold tracking-tight text-slate-800 dark:text-white font-hand">
          Cine<span className="text-brand-500">Note</span>
        </span>
      </div>

      {/* VIEW: PROFILES (Quick Login) */}
      {view === 'profiles' && (
        <div className="w-full max-w-2xl animate-fade-in-up flex flex-col items-center">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">{t.who_reviewing}</h2>
           
           <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-10">
              {savedAccounts.map(account => (
                <div key={account.id} className="flex flex-col items-center group relative">
                  <button
                    onClick={() => handleProfileClick(account)}
                    disabled={loading}
                    className={`
                      relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-3xl font-bold text-white
                      shadow-lg transition-all duration-300
                      ${isEditing ? 'animate-pulse bg-slate-400 dark:bg-slate-700 cursor-default' : 'bg-brand-500 hover:bg-brand-600 hover:scale-105 hover:shadow-brand-500/40 hover:-rotate-2'}
                    `}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : account.username.substring(0, 2).toUpperCase()}
                    
                    {/* Delete Button Overlay */}
                    {isEditing && (
                      <div 
                        onClick={(e) => handleRemoveProfile(e, account.id)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-red-600 hover:scale-110 cursor-pointer z-10"
                      >
                        <X size={16} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                  <span className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {account.username}
                  </span>
                </div>
              ))}

              {/* Add Profile Button */}
              <div className="flex flex-col items-center">
                 <button
                    onClick={() => setView('login')}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800 transition-all duration-300"
                 >
                    <Plus size={32} />
                 </button>
                 <span className="mt-3 text-sm font-medium text-slate-400">{t.add_account}</span>
              </div>
           </div>

           <button 
             onClick={() => setIsEditing(!isEditing)}
             className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isEditing ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
           >
             {isEditing ? t.done : t.manage_profiles}
           </button>
        </div>
      )}

      {/* VIEW: FORM (Login/Signup) */}
      {view === 'login' && (
        <div className="w-full max-w-[360px] animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700/50 p-8">
            
            <div className="mb-6 text-center relative">
               {savedAccounts.length > 0 && (
                 <button 
                   onClick={() => setView('profiles')}
                   className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
                   title="Back to profiles"
                 >
                   <X size={20} />
                 </button>
               )}
               <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                 {isLoginMode ? t.login : t.join_cinenote}
               </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative group">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black/20 rounded-2xl focus:ring-2 focus:ring-brand-500/50 outline-none transition-all dark:text-white placeholder:text-slate-400 font-medium text-sm"
                    placeholder={t.username}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black/20 rounded-2xl focus:ring-2 focus:ring-brand-500/50 outline-none transition-all dark:text-white placeholder:text-slate-400 font-medium text-sm"
                    placeholder={t.password}
                    autoComplete={isLoginMode ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium text-center animate-pulse border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/25 mt-2 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <span>{isLoginMode ? t.login : t.create_account}</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
               <button 
                  onClick={() => { setError(''); setIsLoginMode(!isLoginMode); }}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                >
                  {isLoginMode ? t.no_account : t.back_login}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
