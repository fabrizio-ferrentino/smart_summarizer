import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.AI_PROVIDER':       JSON.stringify(env.AI_PROVIDER || 'gemini'),
      'process.env.GEMINI_API_KEY':    JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENAI_API_KEY':    JSON.stringify(env.OPENAI_API_KEY),
      'process.env.OPENAI_MODEL':      JSON.stringify(env.OPENAI_MODEL || 'gpt-4o'),
      'process.env.ANTHROPIC_API_KEY': JSON.stringify(env.ANTHROPIC_API_KEY),
      'process.env.ANTHROPIC_MODEL':   JSON.stringify(env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
