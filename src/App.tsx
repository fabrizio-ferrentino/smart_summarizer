import React, { useState, useRef } from 'react';
import { FileAudio, UploadCloud, Link as LinkIcon, Loader2, FileText, Download, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { summarizeMeeting } from './lib/gemini';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError(null);
    // Check file size (limit to 19 MB per API constraints for inline base64)
    const MAX_SIZE = 19 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setError(`Il file è troppo grande (${(selectedFile.size / 1024 / 1024).toFixed(1)}MB). Il limite massimo è 19MB per questa demo.`);
      return;
    }
    
    // Check if it's audio or video
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
      setError("Per favore seleziona un file audio o video valido.");
      return;
    }
    
    setFile(selectedFile);
  };

  const handleProcess = async () => {
    if (activeTab === 'youtube') {
      setError("L'elaborazione diretta da YouTube richiede un server backend per lo scraping e non è supportata in questa demo frontend. Per favore, scarica l'audio e usa la scheda 'Carica Audio'.");
      return;
    }

    if (!file) {
      setError("Per favore seleziona un file prima di procedere.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await summarizeMeeting(file);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante l'elaborazione del file.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('summary-content-to-print');
    if (!element) return;
    
    // Add a temporary wrapper class if needed, but we capture the element directly.
    const opt = {
      margin:       10,
      filename:     'Riassunto_SmartSum.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleEmailSummary = () => {
    if (!summary) return;
    const subject = encodeURIComponent("Riassunto della Riunione & Action Items");
    const body = encodeURIComponent(
      "Ecco il riassunto generato automaticamente:\n\n" + 
      summary + 
      "\n\nGenerato con Smart Summarizer Pro."
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const resetAll = () => {
    setFile(null);
    setSummary(null);
    setError(null);
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header - Hidden on Print */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 py-4 px-6 no-print flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 text-indigo-500">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white"><FileAudio className="w-5 h-5" /></div>
          <h1 className="text-xl font-semibold tracking-tight text-white italic">Smart Summarizer Pro</h1>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <div className="text-white border-b-2 border-indigo-500 pb-1 pt-1">Portfolio Project</div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-10 flex flex-col no-print">
        
        <AnimatePresence mode="wait">
          {!summary ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-10 mt-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Trasforma le tue riunioni in <span className="text-indigo-400">Action Items</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Carica un file audio o video. La nostra IA ascolterà, strutturerà e preparerà i punti chiave da condividere con il tuo team.
                </p>
              </div>

              {/* Card Container */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden max-w-2xl mx-auto w-full shadow-lg shadow-black/20">
                
                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                      activeTab === 'upload' 
                        ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                    )}
                  >
                    <UploadCloud className="w-4 h-4" />
                    Carica Audio / Video
                  </button>
                  <button 
                    onClick={() => setActiveTab('youtube')}
                    className={cn(
                      "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                      activeTab === 'youtube' 
                        ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    Link YouTube
                  </button>
                </div>

                <div className="p-8">
                  {/* Upload UI */}
                  {activeTab === 'upload' && (
                    <div className="flex flex-col items-center">
                      {!file ? (
                        <div 
                          className="w-full border-2 border-dashed border-slate-800 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-slate-700 transition-colors bg-slate-900/30 group"
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-indigo-400 mb-4">
                            <UploadCloud className="w-8 h-8 group-hover:text-indigo-300 transition-colors" />
                          </div>
                          <p className="text-slate-300 font-medium text-lg mb-1 group-hover:text-white transition-colors">Clicca per caricare o trascina il file</p>
                          <p className="text-slate-500 text-sm mb-4">MP3, WAV, MP4, WEBM (Max 19MB)</p>
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            accept="audio/*,video/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFileSelection(e.target.files[0]);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full border border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-800/50">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 text-emerald-400">
                            <FileAudio className="w-6 h-6" />
                          </div>
                          <p className="text-white font-medium text-center truncate max-w-full px-4">{file.name}</p>
                          <p className="text-slate-400 text-sm mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button 
                            onClick={() => setFile(null)}
                            className="text-sm text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Rimuovi file
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube UI */}
                  {activeTab === 'youtube' && (
                    <div className="flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Incolla URL YouTube</label>
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-shadow"
                      />
                      <div className="mt-4 flex items-start gap-2 p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>
                          <strong>Nota per la demo:</strong> Il supporto YouTube richiede un backend (es. yt-dlp) per estrarre l'audio a causa delle policy CORS. Cliccare su 'Genera Riassunto' mostrerà un errore programmatico.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="mt-6 p-4 bg-rose-500/10 text-rose-400 rounded-lg text-sm border border-rose-500/20 flex items-start gap-2">
                       <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                       <p>{error}</p>
                    </div>
                  )}

                  {/* Process Button */}
                  <div className="mt-8">
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || (activeTab === 'upload' && !file) || (activeTab === 'youtube' && !url)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analisi in corso tramite Gemini AI...
                        </>
                      ) : (
                        <>
                          Genera Riassunto Strutturato
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={resetAll}
                  className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Nuova Analisi
                </button>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleEmailSummary}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Invia Email
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-indigo-900/20"
                  >
                    <Download className="w-4 h-4" />
                    Esporta PDF
                  </button>
                </div>
              </div>

              {/* Summary Document */}
              <div id="summary-content-to-print" className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 md:p-12 print-clean shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-800 no-print">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider text-xs hidden">Report della Riunione</h2>
                    <h2 className="text-2xl font-bold text-white">Report della Riunione</h2>
                    <p className="text-sm text-slate-400 mt-1">Generato da Smart Summarizer Pro</p>
                  </div>
                </div>

                <div className="markdown-body">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Print-only layout (hidden normally) */}
      <div className="hidden print-only p-8 max-w-4xl mx-auto bg-white min-h-screen">
        <div className="mb-8 pb-4 border-b-2 border-gray-200">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <FileAudio className="w-6 h-6" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Smart Summarizer Pro</h1>
          </div>
          <p className="text-gray-500">Report generato automaticamente il {new Date().toLocaleDateString('it-IT')}</p>
        </div>
        <div className="markdown-body">
          {summary && <ReactMarkdown>{summary}</ReactMarkdown>}
        </div>
      </div>
    </div>
  );
}
