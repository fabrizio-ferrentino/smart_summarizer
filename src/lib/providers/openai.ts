import OpenAI from 'openai';
import { translations, Language } from '../translations';
import type { AIProvider } from './interface';

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _client;
}

const MODEL_TEXT = process.env.OPENAI_MODEL || 'gpt-4o';
const MODEL_AUDIO = 'gpt-4o-audio-preview';

const MIME_TO_FORMAT: Record<string, string> = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/wave': 'wav',
  'audio/webm': 'webm',
  'video/webm': 'webm',
};

export class OpenAIProvider implements AIProvider {
  readonly supportsAudio = true;
  readonly name = 'OpenAI';

  async generateTitle(summary: string, lang: Language = 'en'): Promise<string> {
    try {
      const prompt = lang === 'it'
        ? "Genera un titolo molto breve (massimo 5-6 parole) che riassuma questo testo. Restituisci SOLO il titolo senza virgolette e nient'altro:"
        : 'Generate a very short title (max 5-6 words) that summarizes this text. Return ONLY the title without quotes and nothing else:';
      const response = await getClient().chat.completions.create({
        model: MODEL_TEXT,
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt + '\n\n' + summary.substring(0, 1500) }],
      });
      return response.choices[0]?.message?.content?.trim().replace(/^"|"$/g, '')
        || (lang === 'it' ? 'Riassunto Generato' : 'Generated Summary');
    } catch {
      return lang === 'it' ? 'Riassunto Generato' : 'Generated Summary';
    }
  }

  async summarizeMeeting(audioBase64: string, mimeType: string, lang: Language = 'en'): Promise<string> {
    const t = translations[lang].prompt;
    const format = MIME_TO_FORMAT[mimeType];
    if (!format) {
      throw new Error(
        lang === 'it'
          ? 'Formato non supportato da OpenAI. Usa MP3, WAV o WebM.'
          : 'Format not supported by OpenAI. Please use MP3, WAV, or WebM.'
      );
    }
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
      const response = await getClient().chat.completions.create({
        model: MODEL_AUDIO,
        messages: [
          { role: 'system', content: t.system },
          {
            role: 'user',
            content: [
              { type: 'input_audio', input_audio: { data: audioBase64, format: format as any } },
              { type: 'text', text: userPrompt },
            ] as any,
          },
        ],
      });
      return response.choices[0]?.message?.content || t.no_text;
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
      const response = await getClient().chat.completions.create({
        model: MODEL_TEXT,
        messages: [
          { role: 'system', content: t.system },
          { role: 'user', content: userPrompt },
        ],
      });
      return response.choices[0]?.message?.content || t.no_text;
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
      const response = await getClient().chat.completions.create({
        model: MODEL_TEXT,
        messages: [
          { role: 'system', content: t.system },
          { role: 'user', content: userPrompt },
        ],
      });
      return response.choices[0]?.message?.content || t.no_text;
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('quota')) {
        throw new Error(translations[lang].app.errorQuota);
      }
      throw new Error(t.error_youtube);
    }
  }
}
