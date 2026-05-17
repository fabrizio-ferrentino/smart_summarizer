export interface SavedSummary {
  id: string;
  title: string;
  date: number;
  content: string;
  sourceType: 'file' | 'youtube';
  sourceName: string;
}

const STORAGE_KEY = 'smart_summarizer_history';
const MAX_HISTORY = 10;

export const saveHistory = (summary: SavedSummary) => {
  const history = getHistory();
  // Remove if it's an exact duplicate of ID (though IDs are unique usually)
  const updated = [summary, ...history.filter(h => h.id !== summary.id)].slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
};

export const getHistory = (): SavedSummary[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const deleteHistoryItem = (id: string) => {
  const history = getHistory();
  const updated = history.filter(h => h.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) { }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { }
};
