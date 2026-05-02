import express from 'express';
import { createServer as createViteServer } from 'vite';
import { getVideoDetails } from 'youtube-caption-extractor';
import path from 'path';

// Helper to extract video ID from various YouTube URL formats
function extractVideoID(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

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

      console.log('Fetching data for:', url);
      const videoID = extractVideoID(url);
      
      if (!videoID) {
        return res.status(400).json({ error: 'URL di YouTube non valido.' });
      }

      const details = await getVideoDetails({ videoID, lang: 'it' }).catch(() => getVideoDetails({ videoID, lang: 'en' }));
      
      if (!details) {
         throw new Error("Dettagli non trovati");
      }

      const hasSubtitles = details.subtitles && details.subtitles.length > 0;
      
      if (hasSubtitles) {
        const fullText = details.subtitles.map(t => t.text).join(' ');
        res.json({ 
          text: `Titolo: ${details.title}\n\nTrascrizione: ${fullText}`,
          hasSubtitles: true 
        });
      } else {
        // Fallback using title and description only
        res.json({
          text: `Titolo: ${details.title}\n\nDescrizione: ${details.description}\n\n[NOTA: Sottotitoli non disponibili o bloccati su questo video. Questo è un riassunto basato solo su Titolo e Descrizione.]`,
          hasSubtitles: false,
          warning: "Sottotitoli non disponibili. Riassunto basato su titolo e descrizione."
        });
      }
    } catch (error: any) {
      console.error('YouTube API Error:', error);
      res.status(500).json({ 
        error: "Impossibile accedere al video. Verificare che l'URL sia corretto e il video sia pubblico." 
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
