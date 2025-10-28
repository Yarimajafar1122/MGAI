// Fix: Add types for Web Speech API to resolve TypeScript errors.
// These types are not included in default TypeScript DOM library definitions.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { FileData } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string, file?: FileData | null) => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<FileData | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [text, resizeTextarea]);
  
  useEffect(() => {
    if (typeof window === 'undefined' || (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window))) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text, file);
      setText('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [text, file, isLoading, onSendMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // Simple validation for image types
        if (!selectedFile.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64 = (loadEvent.target?.result as string)?.split(',')[1];
            if (base64) {
                setFile({
                    base64,
                    mimeType: selectedFile.type,
                });
            }
        };
        reader.readAsDataURL(selectedFile);
    }
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setText(''); // Clear text before starting new recording
      recognition.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
      <path d="M5.5 8.5a.5.5 0 0 1 .5.5v1.5a4 4 0 0 0 8 0V9a.5.5 0 0 1 1 0v1.5a5 5 0 0 1-4.472 4.975V17.5a.5.5 0 0 1-1 0v-2.025A5 5 0 0 1 4.5 10.5V9a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );

  const StopIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H8Z" />
    </svg>
  );

  const AttachIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.53 9.53l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.452a1.125 1.125 0 0 0 1.59 1.591l3.456-3.554a3 3 0 0 0 0-4.242Z" clipRule="evenodd" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-2 bg-slate-800 rounded-xl shadow-lg mb-4">
      {file && (
        <div className="relative p-2 mb-2 border border-slate-700 rounded-lg self-start">
            <img 
                src={`data:${file.mimeType};base64,${file.base64}`} 
                alt="File preview"
                className="max-h-24 rounded-md"
            />
            <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full p-0.5 w-6 h-6 flex items-center justify-center hover:bg-red-500 transition-colors"
                aria-label="Remove file"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </button>
        </div>
      )}
      <div className="flex items-end space-x-3">
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type or speak your message..."
          rows={1}
          className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none max-h-40 p-2"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={isLoading}
          className="rounded-lg p-2.5 h-11 w-11 flex-shrink-0 flex items-center justify-center transition-colors bg-slate-700 text-gray-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500"
          aria-label="Attach file"
        >
          <AttachIcon />
        </button>
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading}
          className={`rounded-lg p-2.5 h-11 w-11 flex-shrink-0 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${isRecording ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse' : 'bg-slate-700 text-gray-300 hover:bg-slate-600 focus:ring-cyan-500'}`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </button>
        <button
          type="submit"
          disabled={isLoading || (!text.trim() && !file)}
          className="bg-blue-600 text-white rounded-lg p-2.5 h-11 w-11 flex-shrink-0 flex items-center justify-center disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="Send message"
        >
          {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.949a.75.75 0 0 0 .95.539l4.95-1.413a.75.75 0 0 0-.424-1.455L4.343 8.122l-1.238-4.333ZM11.05 8.122a.75.75 0 0 0-.424 1.455l4.95 1.413a.75.75 0 0 0 .95-.539l1.414-4.949a.75.75 0 0 0-.826-.95L11.05 8.122Z" />
              </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
