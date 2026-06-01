import Anthropic from '@anthropic-ai/sdk';
import { translations, Language } from '../translations.js';
import type { AIProvider } from './interface.js';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _client;
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

function extractText(message: Anthropic.Message): string {
  const block = message.content[0];
  return block?.type === 'text' ? block.text : '';
}

export class AnthropicProvider implements AIProvider {
  readonly supportsAudio = false;
  readonly name = 'Claude';

  async generateTitle(summary: string, lang: Language = 'en'): Promise<string> {
    try {
      const prompt = lang === 'it'
        ? "Genera un titolo molto breve (massimo 5-6 parole) che riassuma questo testo. Restituisci SOLO il titolo senza virgolette e nient'altro:"
        : 'Generate a very short title (max 5-6 words) that summarizes this text. Return ONLY the title without quotes and nothing else:';
      const message = await getClient().messages.create({
        model: MODEL,
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt + '\n\n' + summary.substring(0, 1500) }],
      });
      return extractText(message).trim().replace(/^"|"$/g, '')
        || (lang === 'it' ? 'Riassunto Generato' : 'Generated Summary');
    } catch {
      return lang === 'it' ? 'Riassunto Generato' : 'Generated Summary';
    }
  }

  async summarizeMeeting(_audioBase64: string, _mimeType: string, lang: Language = 'en'): Promise<string> {
    throw new Error(translations[lang].app.uploadNotSupported);
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
      const message = await getClient().messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: t.system,
        messages: [{ role: 'user', content: userPrompt }],
      });
      return extractText(message) || t.no_text;
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
      const message = await getClient().messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: t.system,
        messages: [{ role: 'user', content: userPrompt }],
      });
      return extractText(message) || t.no_text;
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.toLowerCase().includes('quota')) {
        throw new Error(translations[lang].app.errorQuota);
      }
      throw new Error(t.error_youtube);
    }
  }
}
