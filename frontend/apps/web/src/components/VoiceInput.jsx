import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

export default function VoiceInput({ onTranscript, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in your browser. Please try Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      if (event.error === "no-speech") {
        alert("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        alert(
          "Microphone access denied. Please enable microphone permissions.",
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
        isListening
          ? "bg-[#DC2626] dark:bg-[#EF4444] animate-pulse"
          : "bg-[#F3F4F6] dark:bg-[#262626] hover:bg-[#E5E7EB] dark:hover:bg-[#333333]"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={
        isListening ? "Listening... Click to stop" : "Click to use voice input"
      }
    >
      {isListening ? (
        <MicOff size={18} className="text-white" />
      ) : (
        <Mic size={18} className="text-[#70757F] dark:text-[#A8ADB4]" />
      )}
    </button>
  );
}
