import type { Language } from '../translations';

export interface AIProvider {
  readonly supportsAudio: boolean;
  readonly name: string;
  generateTitle(summary: string, lang: Language): Promise<string>;
  summarizeMeeting(audioBase64: string, mimeType: string, lang: Language): Promise<string>;
  summarizePastedText(text: string, lang: Language): Promise<string>;
  summarizeYoutubeText(transcript: string, url: string | undefined, lang: Language): Promise<string>;
}
