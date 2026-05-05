import React, { useState, useRef, useEffect } from 'react';
import { FileAudio, UploadCloud, Github, Loader2, FileText, Download, Mail, ArrowLeft, AlertCircle, Sparkles, Link as LinkIcon, ChevronDown, Check, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { summarizeMeeting } from './lib/gemini';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import About from './components/About';
import { translations, Language } from './lib/translations';

const LanguageSelector = ({ current, onChange }: { current: Language; onChange: (l: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' }
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white rounded-md pl-3 pr-2.5 py-1.5 outline-none text-xs transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
      >
        <Languages className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-medium">{languages.find(l => l.code === current)?.label}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl shadow-black/40 overflow-hidden z-20 overflow-y-auto"
          >
            <div className="p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors text-left",
                    current === lang.code 
                      ? "bg-indigo-600/20 text-indigo-400" 
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  {lang.label}
                  {current === lang.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube' | 'about'>('upload');
  const [lang, setLang] = useState<Language>('en');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].app;

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
      setError(t.errorSize);
      return;
    }
    
    // Check if it's audio or video
    if (!selectedFile.type.startsWith('audio/') && !selectedFile.type.startsWith('video/')) {
      setError(t.errorType);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (activeTab === 'youtube') {
        if (!url) {
          setError(t.errorYoutubeEmpty);
          setIsProcessing(false);
          return;
        }

        // Fetch transcript from backend
        const response = await fetch('/api/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || t.errorYoutubeFetch);
        }

        const data = await response.json();
        
        // Pass to specialized function that handles text, not file
        const { summarizeYoutubeText } = await import('./lib/gemini');
        const result = await summarizeYoutubeText(data.text, url, lang);
        setSummary(result);
        
      } else {
        if (!file) {
          setError(t.errorFileEmpty);
          setIsProcessing(false);
          return;
        }

        const result = await summarizeMeeting(file, lang);
        setSummary(result);
      }
    } catch (err: any) {
      setError(err.message || t.errorProcess);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!summary) return;
    setIsProcessing(true);
    try {
      const { generatePDF } = await import('./lib/generatePDF');
      await generatePDF(summary, lang);
    } catch (err) {
      console.error(err);
      alert(t.errorPDF);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSummary = () => {
    if (!summary) return;
    const subject = encodeURIComponent(t.emailSubject);
    const body = encodeURIComponent(
      t.emailBody1 + 
      summary + 
      t.emailBody2
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
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 p-3 md:py-4 md:px-6 no-print flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="https://github.com/fabrizio-ferrentino/smart_summarizer" target="_blank" className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0">
              <Github className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2 text-indigo-500 cursor-pointer" onClick={() => setActiveTab('upload')}>
              <img src="/favicon.svg" alt="Smart Summarizer Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shadow-sm shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-[14px] sm:text-base md:text-xl font-semibold tracking-tight text-white italic leading-none">
                  Smart Summarizer
                </h1>
                <a href="https://fabrizioferrentino.vercel.app" target="_blank" className="text-[10px] md:text-xs text-indigo-400 hover:underline leading-tight mt-0.5">by Fabrizio Ferrentino</a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:hidden shrink-0">
            <LanguageSelector current={lang} onChange={setLang} />
            <button onClick={() => setActiveTab('about')} className={cn("text-[13px] hover:text-white transition-colors cursor-pointer font-medium", activeTab === 'about' ? "text-white" : "text-slate-400")}>{t.aboutTab}</button>
          </div>
        </div>

        {/* Centered Selectors on Desktop */}
        <div className="hidden sm:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center">
          <LanguageSelector current={lang} onChange={setLang} />
        </div>

        <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-400 shrink-0">
          <button onClick={() => setActiveTab('about')} className={cn("hover:text-white transition-colors cursor-pointer", activeTab === 'about' ? "text-white" : "text-slate-400")}>{t.aboutTab}</button>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 md:p-10 flex flex-col no-print">
        
        <AnimatePresence mode="wait">
          {activeTab === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <About lang={lang} onBack={() => setActiveTab('upload')} />
            </motion.div>
          ) : !summary ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-10 mt-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                  {t.heroTitle}<span className="text-indigo-400">{t.heroHighlight}</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  {t.heroDesc}
                </p>
              </div>

              {/* Card Container */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden max-w-2xl mx-auto w-full shadow-lg shadow-black/20">
                
                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                  <button 
                    onClick={() => setActiveTab('upload')}
                    className={cn(
                      "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      activeTab === 'upload' 
                        ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                    )}
                  >
                    <UploadCloud className="w-4 h-4" />
                    {t.tabUpload}
                  </button>
                  <button 
                    onClick={() => setActiveTab('youtube')}
                    className={cn(
                      "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      activeTab === 'youtube' 
                        ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50" 
                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/30"
                    )}
                  >
                    <LinkIcon className="w-4 h-4" />
                    {t.tabYoutube}
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
                          <p className="text-slate-300 font-medium text-lg mb-1 group-hover:text-white transition-colors">{t.uploadTitle}</p>
                          <p className="text-slate-500 text-sm mb-4">{t.uploadLimits}</p>
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
                            className="text-sm text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                          >
                            {t.removeFile}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* YouTube UI */}
                  {activeTab === 'youtube' && (
                    <div className="flex flex-col">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">{t.youtubeLabel}</label>
                      <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder={t.youtubePlaceholder}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-shadow"
                      />
                      <div className="mt-4 flex items-start gap-2 p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm">
                        <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>
                          {t.youtubeHint}
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
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.buttonProcessing}
                        </>
                      ) : (
                        <>
                          {t.buttonProcess}
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <button 
                  onClick={resetAll}
                  className="w-full sm:w-auto text-slate-400 hover:text-white flex items-center justify-center sm:justify-start gap-2 transition-colors font-medium text-sm cursor-pointer border border-slate-800 sm:border-none py-2 sm:py-0 rounded-lg sm:rounded-none bg-slate-900/50 sm:bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.btnNewAnalysis}
                </button>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleEmailSummary}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t.btnEmail}</span>
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-indigo-900/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t.btnExportPDF}</span>
                  </button>
                </div>
              </div>

              {/* Summary Document */}
              <div id="summary-content-to-print" className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 md:p-12 print-clean shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 mb-6 pb-6 md:mb-8 md:pb-8 border-b border-slate-800 no-print">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider text-xs hidden">{t.reportTitle}</h2>
                    <h2 className="text-2xl font-bold text-white">{t.reportTitle}</h2>
                    <p className="text-sm text-slate-400 mt-1">{t.reportGenerated}</p>
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

    </div>
  );
}
