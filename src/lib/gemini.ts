import { GoogleGenAI } from '@google/genai';

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
export async function summarizeMeeting(file: File): Promise<string> {
  const prompt = `
Sei un assistente esperto e versatile. Ascolta attentamente questa registrazione (può essere una riunione, una lezione, un'intervista o un video qualsiasi) e fornisci un report professionale in italiano.

NON rifiutarti mai di riassumere l'audio. Se è una lezione, usala come se fosse la riunione da analizzare, estraendo formule, procedure e concetti. 

Il tuo output deve essere formattato rigorosamente in **Markdown** e includere ESATTAMENTE queste sezioni, indipendentemente dal tipo di audio:

# 📝 Riassunto
(Un paragrafo chiaro e conciso o una sintesi di massimo 4 frasi che catturi l'essenza della discussione o della lezione)

# 🎯 Punti Chiave
(Un elenco puntato con i 3-5 argomenti principali discussi o insegnati)
* ...
* ...

# 🚀 Action Items / Da Ricordare
(Un elenco di azioni da fare se è una riunione, oppure regole/formule/appunti critici se è una lezione. Usa sempre le checkbox markdown - )
- ...
- ...

Se il file è molto corto o silenzioso, spiegalo gentilmente ma mantieni la struttura.
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
    
    return response.text || "Nessun testo generato. Si prega di riprovare.";
  } catch (error) {
    console.error("Errore durante la generazione del riassunto:", error);
    throw new Error("Errore durante l'analisi del file. Potrebbe essere troppo grande o non supportato.");
  }
}
