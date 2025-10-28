import React from 'react';
import type { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
        U
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400 flex-shrink-0">
         <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    </div>
);


const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white rounded-br-none'
    : 'bg-slate-800 text-gray-200 rounded-bl-none';

  const containerClasses = isUser
    ? 'flex items-end justify-end'
    : 'flex items-end justify-start';

  return (
    <div className={`${containerClasses} my-4`}>
        <div className={`flex items-start gap-3 max-w-xl ${isUser ? 'flex-row-reverse' : ''}`}>
             {isUser ? <UserIcon /> : <ModelIcon />}
             <div className={`px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
                 {message.file && (
                    <img 
                        src={`data:${message.file.mimeType};base64,${message.file.base64}`} 
                        alt="User upload" 
                        className="mb-2 rounded-lg max-w-xs max-h-64 object-contain"
                    />
                 )}
                 {message.text && <p className="text-base whitespace-pre-wrap">{message.text}</p>}
             </div>
        </div>
    </div>
  );
};

export default ChatBubble;
