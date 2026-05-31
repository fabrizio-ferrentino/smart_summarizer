# 🤖 Smart Summarizer

**Smart Summarizer** is a powerful, AI-driven web application designed to automatically distill lengthy audio, video, YouTube content, or plain text into crisp, structured summaries. It supports multiple AI providers — **Google Gemini**, **OpenAI**, and **Anthropic Claude** — switchable with a single environment variable.



## 🚀 Purpose and Why It Exists
Smart Summarizer was born out of a desire to experiment with and explore the vast potential of Artificial Intelligence (specifically Multimodal LLMs) applied to everyday media consumption. In today's fast-paced world, watching a 2-hour meeting recording or a long tutorial can be incredibly time-consuming. 

This tool exists to **save time and boost productivity**. It acts as your personal AI assistant that "listens" to or "watches" content for you, instantly generating meeting minutes, action items, key takeaways, and even pre-formatted email updates to share with your team.



## ✨ Features
- **Multimodal Uploads**: Directly upload audio and video files (.mp3, .wav, .mp4, .webm) up to 19 MB.
- **YouTube Link**: Paste a YouTube URL to extract and summarize the transcript (or title + description as fallback).
- **Paste Text**: Summarize any article, document, or block of text instantly.
- **Multi-Provider AI**: Choose between Google Gemini, OpenAI (GPT-4o), or Anthropic Claude — each with its own API key.
- **Structured Outputs**: Doesn't just give you a block of text. It categorizes the output into:
  - 📝 Executive Summaries
  - 🔑 Key Points
  - 🎯 Action Items (To-Dos)
- **Multilingual Support**: Fully localized in English and Italian, detecting the optimal language based on your preferences.
- **Responsive Design**: A sleek, dark-themed UI built with modern principles, functional on both desktop and mobile devices.
- **History**: Recent summaries are saved locally for quick access.

## 🛠 Technologies Used
The project is built on a modern frontend stack to ensure blazing-fast performance and a smooth developer experience:

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) - for instant server start and lightning-fast HMR.
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - for rapid, utility-first UI design.
- **Icons**: [Lucide React](https://lucide.dev/) - for clean, crisp, and consistent iconography.
- **AI Integration**:
  - [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`) — Gemini 2.5 Flash, with native audio/video and Google Search support.
  - [OpenAI SDK](https://www.npmjs.com/package/openai) (`openai`) — GPT-4o for text, `gpt-4o-audio-preview` for audio.
  - [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) (`@anthropic-ai/sdk`) — Claude for text and YouTube summaries.
- **Language**: TypeScript - ensuring type safety and robust code architecture.



## ⚙️ How It Works
1. **Input**: The user provides an input via the UI (either an uploaded file, a YouTube link, or pasted text).
2. **Pre-processing**: The application validates the input and prepares it for the selected AI provider.
3. **Provider Selection**: Based on the `AI_PROVIDER` environment variable, the request is routed to the correct provider (Gemini, OpenAI, or Claude) through a unified provider interface.
4. **Prompt Engineering**: The app constructs a highly specific, language-localized prompt instructing the AI to act as an expert summarizer and format the output in strict Markdown.
5. **AI Processing**: The request is sent to the chosen AI model, which analyzes the content and generates the structured report.
6. **Rendering**: The React frontend renders the Markdown output into a clean, easy-to-read report (Summary, Key Points, Action Items).



## 💻 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- An API key for your chosen AI provider:
  - **Gemini** (advised): [Google AI Studio](https://aistudio.google.com/)
  - **OpenAI**: [platform.openai.com](https://platform.openai.com/api-keys)
  - **Anthropic**: [console.anthropic.com](https://console.anthropic.com/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fabrizio-ferrentino/smart_summarizer
   cd smart_summarizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (copy from `.env.example`) and configure your provider:
   ```env
   # Choose one: gemini | openai | anthropic  (default: gemini)
   AI_PROVIDER="gemini"

   # Add the key for your chosen provider:
   GEMINI_API_KEY="your-gemini-key"
   # OPENAI_API_KEY="your-openai-key"
   # ANTHROPIC_API_KEY="your-anthropic-key"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to `http://localhost:3000` to view the app in action.



## 🧩 Adding a New Provider

1. Create `src/lib/providers/myprovider.ts` implementing the `AIProvider` interface from `interface.ts`
2. Add a `case 'myprovider':` in `src/lib/providers/index.ts`
3. Add the API key to `vite.config.ts` under `define`
4. Document it in `.env.example`

## 📄 License & Credits
Developed with ❤️ by **Fabrizio Ferrentino**. 
Feel free to use, fork, and improve this project!

## 💖 Support
If you like this repository please give it a star! ⭐

<img src="https://img.shields.io/github/stars/fabrizio-ferrentino/smart_summarizer?style=social" alt="GitHub stars">
