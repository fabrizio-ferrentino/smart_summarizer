import { GeminiProvider } from './gemini';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import type { AIProvider } from './interface';

const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

function createProvider(): AIProvider {
  switch (providerName) {
    case 'openai':    return new OpenAIProvider();
    case 'anthropic': return new AnthropicProvider();
    default:          return new GeminiProvider();
  }
}

const provider = createProvider();

export const summarizeMeeting     = provider.summarizeMeeting.bind(provider);
export const summarizePastedText  = provider.summarizePastedText.bind(provider);
export const summarizeYoutubeText = provider.summarizeYoutubeText.bind(provider);
export const generateTitle        = provider.generateTitle.bind(provider);
export const supportsAudio        = provider.supportsAudio;
export const activeProviderName   = provider.name;
