import React from 'react';
import { translations, Language } from '../lib/translations';
import { Github, ArrowLeft, ExternalLink } from 'lucide-react';

export default function About({ lang, onBack }: { lang: Language; onBack: () => void }) {
  const t = translations[lang].about;
  const tn = translations[lang].app;

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {tn.btnHome || 'Home'}
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 md:p-8 shadow-lg shadow-black/20 text-slate-300">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 md:mb-6">{t.title}</h2>
        <p className="mb-4">{t.p1}</p>
        <p className="mb-4">{t.p2}</p>
        <p className="mb-6">{t.p3}</p>

        <a
          href="https://github.com/fabrizio-ferrentino/smart_summarizer"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg
            bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600
            text-slate-300 hover:text-white text-sm font-medium
            transition-all duration-150 group"
        >
          <Github className="w-4 h-4" />
          fabrizio-ferrentino/smart_summarizer
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </a>
      </div>
    </div>
  );
}
