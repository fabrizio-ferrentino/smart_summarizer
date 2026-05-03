import React from 'react';
import { translations, Language } from '../lib/translations';

export default function About({ lang }: { lang: Language }) {
  const t = translations[lang].about;
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg shadow-black/20 text-slate-300">
      <h2 className="text-3xl font-extrabold text-white mb-6">{t.title}</h2>
      <p className="mb-4">{t.p1}</p>
      <p className="mb-4">{t.p2}</p>
      <p>{t.p3}</p>
    </div>
  );
}
