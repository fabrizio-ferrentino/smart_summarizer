/**
 * Costruisce un nome file pulito a partire dal titolo del report.
 * Es: "Riunione Società" -> "riunione-societa-2026-05-31"
 */
export function buildSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slug = (title || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // rimuove i diacritici (à -> a)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60);
  return `${slug || 'summary'}-${date}`;
}

/** Scarica il contenuto markdown come file .md (download locale, nessun upload). */
export function downloadMarkdown(markdown: string, title: string) {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${buildSlug(title)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
