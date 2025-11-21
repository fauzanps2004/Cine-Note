
import React, { useState } from 'react';
import { Key, Save, ExternalLink } from 'lucide-react';
import { setApiKey } from '../services/movieService';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ApiKeyModalProps {
  onSave: () => void;
  language: Language;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, language }) => {
  const [key, setKey] = useState('');
  const t = TRANSLATIONS[language];

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key);
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full text-brand-600 mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.api_modal_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            {t.api_modal_desc}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t.api_placeholder}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none dark:text-white font-mono text-sm text-center"
            autoFocus
          />
          
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Save size={18} />
            <span>{t.save_key_btn}</span>
          </button>

          <a 
            href="https://www.omdbapi.com/apikey.aspx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-4"
          >
            <span>{t.get_key_link}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
