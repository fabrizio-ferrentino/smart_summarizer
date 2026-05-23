import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getVideoDetails } from 'youtube-caption-extractor';

function extractVideoID(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const videoID = extractVideoID(url);
    if (!videoID) return res.status(400).json({ error: 'URL di YouTube non valido.' });

    const details = await getVideoDetails({ videoID, lang: 'it' })
      .catch(() => getVideoDetails({ videoID, lang: 'en' }));

    if (!details) throw new Error('Details Not Found');

    const hasSubtitles = details.subtitles && details.subtitles.length > 0;

    if (hasSubtitles) {
      const fullText = details.subtitles.map((t: any) => t.text).join(' ');
      return res.json({
        text: `Title: ${details.title}\n\nTranscript: ${fullText}`,
        hasSubtitles: true,
      });
    } else {
      return res.json({
        text: `Title: ${details.title}\n\nDescription: ${details.description}\n\n[NOTE: Subtitles not available.]`,
        hasSubtitles: false,
        warning: 'Subtitles not available.',
      });
    }
  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return res.status(500).json({
      error: "Unable to access the video. Please verify that the URL is correct and the video is public.",
    });
  }
}