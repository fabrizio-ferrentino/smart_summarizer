import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleSummarize, type SummarizeInput } from '../src/lib/providers/index.js';

// Reads the raw body if req.body is not already parsed
async function getRawBody(req: VercelRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (!body || typeof body === 'string') {
      const raw = typeof body === 'string' ? body : await getRawBody(req);
      try {
        body = JSON.parse(raw);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const input = body as SummarizeInput;
    if (!input || !input.kind) {
      return res.status(400).json({ error: 'Missing "kind" in request body' });
    }

    const result = await handleSummarize(input);
    return res.json(result);
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    return res.status(500).json({ error: error?.message || 'Error during processing.' });
  }
}
