import { GoogleGenAI } from '@google/genai';
import { translations, Language } from './translations';

// Inizializza il client Gemini utilizzando la chiave API dall'ambiente
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Converte un file locale in un payload Base64 compatibile con Gemini API
 */
export async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Invia l'audio a Gemini per generare il riassunto
 */
export async function summarizeMeeting(file: File, lang: Language = 'en'): Promise<string> {
  const t = translations[lang].prompt;
  const prompt = `
${t.introFile}

${t.rule}

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
    const part = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [part, { text: prompt }]
        }
      ]
    });
    
    return response.text || t.no_text;
  } catch (error) {
    console.error("Errore durante la generazione del riassunto:", error);
    throw new Error(t.error_file);
  }
}

/**
 * Invia il testo di YouTube a Gemini per generare il riassunto
 */
export async function summarizeYoutubeText(transcript: string, url?: string, lang: Language = 'en'): Promise<string> {
  const t = translations[lang].prompt;
  const prompt = `
${t.introYoutube}

${t.rule}

${t.formatInfo}

${t.h1_summary}
${t.h1_summary_desc}

${t.h1_points}
${t.h1_points_desc}

${t.h1_action}
${t.h1_action_desc}

${t.youtube_content}
${transcript}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview', // Switch to pro to use tools effectively
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }] // Enable Google Search for context
      }
    });
    
    return response.text || t.no_text;
  } catch (error) {
    console.error("Errore durante la generazione del riassunto YouTube:", error);
    throw new Error(t.error_youtube);
  }
}
