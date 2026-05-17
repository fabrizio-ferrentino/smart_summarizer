import React, { useMemo } from 'react';
import { translations, Language } from '../lib/translations';
import { SavedSummary } from '../lib/history';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trash2, Link, Sparkles, UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

interface HistoryViewProps {
  history: SavedSummary[];
  lang: Language;
  onSelect: (item: SavedSummary) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

// Restituisce key STABILE (non dipende dalla lingua) + label localizzata separata
function groupByDate(
  history: SavedSummary[],
  locale: string,
  labels: Record<string, string>
): { key: string; label: string; items: SavedSummary[] }[] {
  const now = Date.now();
  const oneDay = 86_400_000;

  const groups: Record<string, SavedSummary[]> = {};

  for (const item of history) {
    const diff = now - item.date;
    let key: string;
    if (diff < oneDay) key = '__today__';
    else if (diff < 2 * oneDay) key = '__yesterday__';
    else if (diff < 7 * oneDay) key = '__week__';
    else {
      // Key stabile: "2025-03" — non dipende dalla lingua
      const d = new Date(item.date);
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  const specialOrder = ['__today__', '__yesterday__', '__week__'];
  const result: { key: string; label: string; items: SavedSummary[] }[] = [];

  for (const key of specialOrder) {
    if (groups[key]) {
      result.push({ key, label: labels[key] ?? key, items: groups[key] });
    }
  }

  for (const [key, items] of Object.entries(groups)) {
    if (!specialOrder.includes(key)) {
      const [year, month] = key.split('-').map(Number);
      const label = new Date(year, month - 1, 1).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      });
      result.push({ key, label, items });
    }
  }

  return result;
}

export default function HistoryView({ history, lang, onSelect, onDelete, onClear }: HistoryViewProps) {
  const t = translations[lang].app;
  const locale = lang === 'it' ? 'it-IT' : 'en-US';

  const labels: Record<string, string> = {
    '__today__': lang === 'it' ? 'Oggi' : 'Today',
    '__yesterday__': lang === 'it' ? 'Ieri' : 'Yesterday',
    '__week__': lang === 'it' ? 'Questa settimana' : 'This week',
  };

  const grouped = useMemo(
    () => groupByDate(history, locale, labels),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, locale]
  );

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-2 pb-3 mb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-md">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {t.historyTitle}
          </h2>
        </div>
        <AnimatePresence>
          {history.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="cursor-pointer text-[10px] font-semibold text-slate-600 hover:text-rose-400 transition-colors uppercase tracking-wide px-2 py-1 rounded-md hover:bg-rose-500/5"
            >
              {t.historyClear}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* List — nessun AnimatePresence sul mapping dei gruppi per evitare
          re-animazioni al cambio lingua */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-6 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
      >
        {history.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-14 px-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[140px]">
              {t.historyEmpty}
            </p>
          </motion.div>
        ) : (
          grouped.map((group, gi) => (
            // key stabile → React non smonta/rimonta al cambio lingua
            <div key={group.key}>
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600 px-2 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {group.items.map((item, i) => (
                    <HistoryCard
                      key={item.id}
                      item={item}
                      index={i + gi * 3}
                      locale={locale}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      deleteLabel={t.historyDelete}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCard({
  item,
  index,
  locale,
  onSelect,
  onDelete,
  deleteLabel,
}: {
  item: SavedSummary;
  index: number;
  locale: string;
  onSelect: (item: SavedSummary) => void;
  onDelete: (id: string) => void;
  deleteLabel: string;
}) {
  const time = new Date(item.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -16, filter: 'blur(4px)', height: 0, marginBottom: 0 }}
      transition={{
        duration: 0.22,
        delay: index * 0.03,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer
        hover:bg-slate-800/50 active:bg-slate-800/70 transition-all duration-150
        border border-transparent hover:border-slate-700/30"
      onClick={() => onSelect(item)}
    >
      <div className={cn(
        "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
        "bg-slate-800/80 group-hover:bg-indigo-500/10",
      )}>
        {item.sourceType === 'youtube'
          ? <Link className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          : <UploadCloud className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        }
      </div>

      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
        <span className="text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors truncate leading-tight">
          {item.title}
        </span>
        <span className="text-[10px] text-slate-600 truncate leading-none">
          {time} · {item.sourceName}
        </span>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="shrink-0 p-1.5 rounded-lg text-slate-700 hover:text-rose-400
          opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 transition-all duration-150 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        title={deleteLabel}
      >
        <Trash2 className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}