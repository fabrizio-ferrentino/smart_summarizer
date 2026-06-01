import type { Language } from './translations';

export interface SummarizeResponse {
  summary: string;
  title: string;
}

export type SummarizePayload =
  | { kind: 'text'; text: string; lang: Language }
  | { kind: 'youtube'; transcript: string; url?: string; lang: Language }
  | { kind: 'file'; audioBase64: string; mimeType: string; lang: Language };

// Converts a file to pure base64 (without the "data:...;base64," prefix).
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Sends the content to the backend, which uses the API keys securely.
export async function requestSummary(payload: SummarizePayload): Promise<SummarizeResponse> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Error during processing.');
  }
  return data as SummarizeResponse;
}
