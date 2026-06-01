import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import type { AIProvider } from './interface';
import type { Language } from '../translations';

const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

function createProvider(): AIProvider {
  switch (providerName) {
    case 'openai':    return new OpenAIProvider();
    case 'anthropic': return new AnthropicProvider();
    default:          return new GeminiProvider();
  }
}

const provider = createProvider();

export const supportsAudio      = provider.supportsAudio;
export const activeProviderName = provider.name;

export type SummarizeInput =
  | { kind: 'text'; text: string; lang: Language }
  | { kind: 'youtube'; transcript: string; url?: string; lang: Language }
  | { kind: 'file'; audioBase64: string; mimeType: string; lang: Language };

export interface SummarizeResult {
  summary: string;
  title: string;
}

/**
 * Single entry point (used by backend): produces summary + title.
 */
export async function handleSummarize(input: SummarizeInput): Promise<SummarizeResult> {
  let summary: string;

  switch (input.kind) {
    case 'text':
      summary = await provider.summarizePastedText(input.text, input.lang);
      break;
    case 'youtube':
      summary = await provider.summarizeYoutubeText(input.transcript, input.url, input.lang);
      break;
    case 'file':
      summary = await provider.summarizeMeeting(input.audioBase64, input.mimeType, input.lang);
      break;
  }

  const title = await provider.generateTitle(summary, input.lang);
  return { summary, title };
}
