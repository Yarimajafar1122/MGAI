import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Message, FileData } from './types';
import { sendMessageToAI } from './services/geminiService';
import Header from './components/Header';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';
import LoadingIndicator from './components/LoadingIndicator';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am MGAI. How can I assist you today?' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (inputText: string, file?: FileData | null) => {
    if (!inputText.trim() && !file) return;

    const newUserMessage: Message = { 
      role: 'user', 
      text: inputText,
      ...(file && { file }),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await sendMessageToAI(inputText, file);
      const newAiMessage: Message = { role: 'model', text: aiResponse };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      const errorAiMessage: Message = { role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </main>
      <div className="sticky bottom-0 bg-slate-900/80 backdrop-blur-sm pt-2 md:pt-4">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
              <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
              {error && <p className="text-red-500 text-sm text-center mt-2 pb-2">{error}</p>}
          </div>
      </div>
    </div>
  );
};

export default App;