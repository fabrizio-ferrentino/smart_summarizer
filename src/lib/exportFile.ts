/**
 * Builds a clean filename from the report title.
 * Ex: "Company Meeting" -> "company-meeting-2026-05-31"
 */
export function buildSlug(title: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slug = (title || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacritics (à -> a)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60);
  return `${slug || 'summary'}-${date}`;
}

/** Downloads text as a .txt file (local download, no upload). */
export function downloadText(text: string, title: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${buildSlug(title)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
