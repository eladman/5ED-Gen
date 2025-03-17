'use client';

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner, FaComments } from 'react-icons/fa';
import { useChat } from 'ai/react';

interface WorkoutChatProps {
  workoutDay: {
    day: string;
    type: 'aerobic' | 'strength';
    title: string;
    exercises: string[];
    duration: string;
    intensity: 'קל' | 'בינוני' | 'גבוה';
    workoutGoal?: string;
  };
  userPreferences: {
    gender: 'male' | 'female';
    group: 'youth' | 'teens' | 'children';
    experienceLevel: '0-4months' | 'upto1year' | '1-2years' | '2-3years' | '3plusYears';
    threeKmTime: string;
    pullUps: number;
  };
}

export default function WorkoutChat({ workoutDay, userPreferences }: WorkoutChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatId] = useState(`workout-chat-${Date.now()}`); // Create a unique ID for this chat instance
  
  // Create a system message with workout details and user preferences
  const initialSystemMessage = `
    You are a helpful workout assistant that provides personalized advice.
    
    Workout details:
    - Type: ${workoutDay.type === 'aerobic' ? 'אירובי' : 'כוח'}
    - Title: ${workoutDay.title}
    - Exercises: ${workoutDay.exercises.join(', ')}
    - Duration: ${workoutDay.duration}
    - Intensity: ${workoutDay.intensity}
    ${workoutDay.workoutGoal ? `- Goal: ${workoutDay.workoutGoal}` : ''}
    
    User preferences:
    - Gender: ${userPreferences.gender === 'male' ? 'זכר' : 'נקבה'}
    - Age group: ${userPreferences.group}
    - Experience level: ${userPreferences.experienceLevel}
    - 3km run time: ${userPreferences.threeKmTime}
    - Pull-ups: ${userPreferences.pullUps}
    
    Please provide helpful, personalized advice based on these details. Answer in Hebrew.
  `;

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/openai/chat',
    id: chatId, // Use the unique ID to prevent chat sessions from mixing
    initialMessages: [
      {
        id: 'system-1',
        role: 'system',
        content: initialSystemMessage,
      }
    ],
    onError: (error) => {
      console.error("Chat error:", error);
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Log for debugging
  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-4 bg-gradient-to-r from-[#ff8714] to-[#ff6a00] text-white rounded-lg hover:from-[#e67200] hover:to-[#e05e00] transition-all shadow-md flex items-center justify-center gap-2"
      >
        <FaComments className="w-4 h-4" />
        {isOpen ? 'סגור צ\'אט' : 'שאל שאלות על האימון'}
      </button>
      
      {isOpen && (
        <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length <= 1 && (
              <div className="text-center text-gray-500 my-4">
                שאל שאלות על האימון כמו "באיזה קצב כדאי לי לרוץ?" או "איך אני יכול להתקדם בתרגיל X?"
              </div>
            )}
            {messages.filter(m => m.role !== 'system').map((message) => (
              <div 
                key={message.id} 
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-[#ff8714] text-white self-end' 
                    : 'bg-white border border-gray-200 self-start'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg max-w-[80%] bg-white border border-gray-200 self-start flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                <span>טוען תשובה...</span>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg max-w-[80%] bg-red-50 border border-red-200 text-red-600 self-start">
                שגיאה בטעינת התשובה. אנא נסה שוב.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="שאל שאלה על האימון..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:border-transparent text-right"
              dir="rtl"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-r from-[#ff8714] to-[#ff6a00] text-white rounded-lg hover:from-[#e67200] hover:to-[#e05e00] transition-all shadow-md disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 