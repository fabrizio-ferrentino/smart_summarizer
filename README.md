# 🤖 Smart Summarizer

**Smart Summarizer** is a powerful, AI-driven web application designed to automatically distill lengthy audio, video, or YouTube content into crisp, structured summaries. 

---

## 🚀 Purpose and Why It Exists
Smart Summarizer was born out of a desire to experiment with and explore the vast potential of Artificial Intelligence (specifically Multimodal LLMs) applied to everyday media consumption. In today's fast-paced world, watching a 2-hour meeting recording or a long tutorial can be incredibly time-consuming. 

This tool exists to **save time and boost productivity**. It acts as your personal AI assistant that "listens" to or "watches" content for you, instantly generating meeting minutes, action items, key takeaways, and even pre-formatted email updates to share with your team.

---

## ✨ Features
- **Multimodal Uploads**: Directly upload audio and video files (.mp3, .wav, .mp4, etc.) or just paste a YouTube URL.
- **AI-Powered Analysis**: Utilizes cutting-edge Gemini AI models to analyze the semantic meaning and context of the media.
- **Structured Outputs**: Doesn't just give you a block of text. It categorizes the output into:
  - 📝 Executive Summaries
  - 🔑 Key Points
  - 🎯 Action Items (To-Dos)
- **Multilingual Support**: Fully localized in English and Italian, detecting the optimal language based on your browser preferences.
- **Responsive Design**: A sleek, dark-themed UI built with modern principles, functional on both desktop and mobile devices.

---

## 🛠 Technologies Used
The project is built on a modern frontend stack to ensure blazing-fast performance and a smooth developer experience:

- **Frontend Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) - for instant server start and lightning-fast HMR.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - for rapid, utility-first UI design.
- **Icons**: [Lucide React](https://lucide.dev/) - for clean, crisp, and consistent iconography.
- **AI Integration**: [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`) - tapping into Gemini's multimodal capabilities (Gemini 2.5 Flash / Pro).
- **Language**: TypeScript - ensuring type safety and robust code architecture.

---

## ⚙️ How It Works
1. **Input**: The user provides an input via the UI (either an uploaded file or a YouTube link).
2. **Pre-processing**: The application validates the input. For direct uploads, it prepares the file for the Gemini API via the `File API`.
3. **Prompt Engineering**: The app constructs a highly specific, language-localized prompt instructing the AI to act as an expert summarizer and format the output into strict JSON.
4. **AI Processing**: The request is securely sent to Google's Gemini models. The AI analyzes the audio/video context and generates the structured JSON.
5. **Rendering**: The React frontend parses the incoming JSON and renders it into beautiful, easy-to-read UI cards (Summary, Key Points, Action Items, Email).

---

## 💻 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone https://github.com/fabrizio-ferrentino/smart_summarizer
   cd smart-summarizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (you can copy from `.env.example` if available) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY="MY_GEMINI_API_KEY"
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to `http://localhost:3000` (or the port specified by Vite) to view the app in action.

---

## 📄 License & Credits
Developed with ❤️ by **Fabrizio Ferrentino**. 
Feel free to use, fork, and improve this project!

## 💖 Support
If you like this repository please give it a star! ⭐

<img src="https://img.shields.io/github/stars/fabrizio-ferrentino/smart_summarizer?style=social" alt="GitHub stars">
