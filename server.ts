import express from 'express';
import { createServer as createViteServer } from 'vite';
import { YoutubeTranscript } from 'youtube-transcript';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for YouTube Transcript
  app.post('/api/youtube', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      console.log('Fetching transcript for:', url);
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      
      const fullText = transcript.map(t => t.text).join(' ');
      res.json({ text: fullText });
    } catch (error: any) {
      console.error('YouTube API Error:', error);
      res.status(500).json({ 
        error: "Impossibile recuperare il file audio/sottotitoli. Il video potrebbe non avere sottotitoli o essere limitato." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production handling
    // Determine __dirname since this is an ES module
    const distPath = path.resolve('./dist');
    app.use(express.static(distPath));
    // Support client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
