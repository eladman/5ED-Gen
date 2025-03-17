'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';

export default function TestChat() {
  const [isVisible, setIsVisible] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/openai/chat',
    id: 'test-chat',
    initialMessages: [
      {
        id: 'system-1',
        role: 'system',
        content: 'You are a helpful assistant. Please answer in Hebrew.',
      }
    ],
  });

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold mb-4">בדיקת צ'אט</h3>
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        {isVisible ? 'הסתר צ\'אט' : 'הצג צ\'אט'}
      </button>
      
      {isVisible && (
        <div>
          <div className="h-64 overflow-y-auto p-4 border border-gray-200 rounded-lg mb-4">
            {messages.filter(m => m.role !== 'system').map((message) => (
              <div 
                key={message.id} 
                className={`p-3 mb-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-100 text-blue-800 text-right' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 bg-gray-100 rounded-lg">
                טוען...
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg">
                שגיאה: {error.message || 'אירעה שגיאה בטעינת התשובה'}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="הקלד הודעה..."
              className="flex-1 p-2 border border-gray-300 rounded-lg"
              dir="rtl"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300"
            >
              שלח
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 