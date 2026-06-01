// Secure provider info for the client: no SDK, no API key.
// The real AI work happens on the backend (see api/summarize.ts).

const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

export const activeProviderName =
  providerName === 'openai' ? 'OpenAI'
  : providerName === 'anthropic' ? 'Claude'
  : 'Gemini';

// Only Anthropic/Claude does not support audio/video upload.
export const supportsAudio = providerName !== 'anthropic';
