import React, { useState, useEffect } from 'react';
import { Film, Loader2, Lock, User as UserIcon } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Auto-fill logic: Check if user logged in before
  useEffect(() => {
    const lastUsername = localStorage.getItem('cinenote_last_username');
    if (lastUsername) {
      setFormData(prev => ({ ...prev, username: lastUsername }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError('Required');
      return;
    }

    setLoading(true);

    try {
      let user;
      if (isLogin) {
        user = await authService.login(formData.username, formData.password);
      } else {
        user = await authService.signup(formData.username, formData.password);
      }
      
      // Save username for next time to auto-fill
      localStorage.setItem('cinenote_last_username', formData.username);
      
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 bg-brand-50 dark:bg-slate-900">
      
      {/* Minimalist Brand */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="bg-brand-600 p-2.5 rounded-xl text-white shadow-lg shadow-brand-500/30 rotate-3">
          <Film size={24} strokeWidth={2.5} />
        </div>
        <span className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-hand">
          Cine<span className="text-brand-500">Note</span>
        </span>
      </div>

      <div className="w-full max-w-[360px] animate-fade-in-up">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700/50 p-8">
          
          <div className="mb-6 text-center">
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">
               {isLogin ? 'Welcome back' : 'New Account'}
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
                  placeholder="Username"
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
                  placeholder="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
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
                <span>{isLogin ? 'Enter' : 'Join'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
             <button 
                onClick={() => { setError(''); setIsLogin(!isLogin); }}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
              >
                {isLogin ? "Create an account" : "Back to login"}
              </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8 font-medium">
          Local storage only. Simplicity first.
        </p>
      </div>
    </div>
  );
};