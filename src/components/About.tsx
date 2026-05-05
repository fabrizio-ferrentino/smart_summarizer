import React from 'react';
import { translations, Language } from '../lib/translations';

export default function About({ lang, onBack }: { lang: Language; onBack: () => void }) {
  const t = translations[lang].about;
  const tn = translations[lang].app; // For the back button text
  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium text-sm cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          {tn.btnHome || "Home"}
        </button>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 md:p-8 shadow-lg shadow-black/20 text-slate-300">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">{t.title}</h2>
        <p className="mb-4">{t.p1}</p>
        <p className="mb-4">{t.p2}</p>
        <p>{t.p3}</p>
      </div>
    </div>
  );
}
