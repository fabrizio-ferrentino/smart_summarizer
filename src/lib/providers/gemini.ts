import { GoogleGenAI } from '@google/genai';
import { translations, Language } from '../translations.js';
import type { AIProvider } from './interface.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set on the server.');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
}

export class GeminiProvider implements AIProvider {
  readonly supportsAudio = true;
  readonly name = 'Gemini';

  async generateTitle(summary: string, lang: Language = 'en'): Promise<string> {
    try {
      const prompt = lang === 'it'
        ? "Genera un titolo molto breve (massimo 5-6 parole) che riassuma questo testo. Restituisci SOLO il titolo senza virgolette e nient'altro:"
        : 'Generate a very short title (max 5-6 words) that summarizes this text. Return ONLY the title without quotes and nothing else:';
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: 'user', parts: [{ text: prompt + '\n\n' + summary.substring(0, 1500) }] }],
      });
      return response.text?.trim().replace(/^"|"$/g, '') || (lang === 'it' ? 'Riassunto Generato' : 'Generated Summary');
    } catch {
      return lang === 'it' ? 'Riassunto Generato' : 'Generated Summary';
    }
  }

  async summarizeMeeting(audioBase64: string, mimeType: string, lang: Language = 'en'): Promise<string> {
    const t = translations[lang].prompt;
    const userPrompt = `
${t.introFile}

${t.formatInfo}

${t.h1_summary}
${t.h1_summary_desc}

${t.h1_points}
${t.h1_points_desc}

${t.h1_action}
${t.h1_action_desc}

${t.short_audio}
`;
    try {
      const part = { inlineData: { data: audioBase64, mimeType } };
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        config: { systemInstruction: t.system },
        contents: [{ role: 'user', parts: [part, { text: userPrompt }] }],
      });
      return response.text || t.no_text;
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('quota')) {
        throw new Error(translations[lang].app.errorQuota);
      }
      throw new Error(t.error_file);
    }
  }

  async summarizePastedText(text: string, lang: Language = 'en'): Promise<string> {
    const t = translations[lang].prompt;
    const userPrompt = `
${t.introText}

${t.formatInfo}

${t.h1_summary}
${t.h1_summary_desc}

${t.h1_points}
${t.h1_points_desc}

${t.h1_action}
${t.h1_action_desc}

${t.textContent}
${text}
`;
    try {
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        config: { systemInstruction: t.system },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      });
      return response.text || t.no_text;
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('quota')) {
        throw new Error(translations[lang].app.errorQuota);
      }
      throw new Error(t.error_file);
    }
  }

  async summarizeYoutubeText(transcript: string, url?: string, lang: Language = 'en'): Promise<string> {
    const t = translations[lang].prompt;
    const urlLine = url ? `${t.youtubeUrl} ${url}\n` : '';
    const userPrompt = `
${t.introYoutube}

${t.formatInfo}

${t.h1_summary}
${t.h1_summary_desc}

${t.h1_points}
${t.h1_points_desc}

${t.h1_action}
${t.h1_action_desc}

${urlLine}${t.youtube_content}
${transcript}
`;
    try {
      const response = await getAI().models.generateContent({
        model: GEMINI_MODEL,
        config: {
          systemInstruction: t.systemYoutube,
          tools: [{ googleSearch: {} }],
        },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      });
      return response.text || t.no_text;
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('quota')) {
        throw new Error(translations[lang].app.errorQuota);
      }
      throw new Error(t.error_youtube);
    }
  }
}
