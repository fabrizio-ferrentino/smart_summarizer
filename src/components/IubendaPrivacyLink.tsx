// components/IubendaPrivacyLink.tsx
import { useEffect } from "react";

export default function IubendaPrivacyLink() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.iubenda.com/iubenda.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <a
      href="https://www.iubenda.com/privacy-policy/54424150"
      className="iubenda-black iubenda-embed no-iub-style inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg h-10"
      title="Privacy Policy"
      target="_blank"
      rel="noopener noreferrer"
    >
      Privacy Policy
    </a>
  );
}