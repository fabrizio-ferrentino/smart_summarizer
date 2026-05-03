import React from 'react';

export default function About() {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-lg shadow-black/20 text-slate-300">
      <h2 className="text-3xl font-extrabold text-white mb-6">About Smart Summarizer</h2>
      <p className="mb-4">
        Smart Summarizer è un piccolo progetto nato con l'obiettivo di sperimentare e approfondire le potenzialità dell'Intelligenza Artificiale applicata all'analisi di contenuti audio e video.
      </p>
      <p className="mb-4">
        Il sito consente di caricare le registrazioni delle proprie riunioni, lezioni o interviste oppure di incollare un link YouTube. Grazie all'integrazione con i modelli di IA di Google, il sistema trascrive (quando necessario) e riassume i contenuti in modo strutturato, facilitando la comprensione e la condivisione delle informazioni.
      </p>
      <p>
        Questo progetto è stato creato a scopo puramente didattico ed è in continua evoluzione.
      </p>
    </div>
  );
}
