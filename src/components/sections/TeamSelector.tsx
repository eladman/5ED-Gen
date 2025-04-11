'use client';

import { useState, useEffect } from 'react';
import { teams } from '@/lib/teamUtils';

interface Team {
  id: string;
  name: string;
}

interface TeamSelectorProps {
  value: string;
  onChange: (teamId: string) => void;
  className?: string;
}

export default function TeamSelector({ value, onChange, className = '' }: TeamSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Find the selected team based on the value prop
  useEffect(() => {
    if (value) {
      const team = teams.find(t => t.id === value);
      setSelectedTeam(team || null);
    } else {
      setSelectedTeam(null);
    }
  }, [value]);
  
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    onChange(team.id);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  return (
    <div className={`relative ${className}`}>
      <div 
        className="flex items-center justify-between border border-gray-300 rounded-md p-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 text-right text-black">
          {selectedTeam ? selectedTeam.name : 'בחר קבוצה'}
        </div>
        <div className="text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש קבוצה..."
              className="w-full p-2 border border-gray-300 rounded-md text-right text-black placeholder:text-gray-400"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {filteredTeams.length > 0 ? (
            <ul className="py-1">
              {filteredTeams.map((team) => (
                <li 
                  key={team.id}
                  className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-right text-black ${selectedTeam?.id === team.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectTeam(team)}
                >
                  {team.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              לא נמצאו קבוצות
            </div>
          )}
        </div>
      )}
    </div>
  );
} 