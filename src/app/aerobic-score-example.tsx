'use client';

import { useState } from 'react';
import { threeKRunScore, threeKRunScoreFromString } from '@/lib/fitnessUtils';

export default function AerobicScoreCalculator() {
  const [timeString, setTimeString] = useState('12:00');
  const [score, setScore] = useState(() => threeKRunScoreFromString('12:00'));

  const handleCalculate = () => {
    try {
      const newScore = threeKRunScoreFromString(timeString);
      setScore(newScore);
    } catch (error) {
      alert('Please enter a valid time in MM:SS format (e.g., 12:00)');
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">3K Run Aerobic Score Calculator</h1>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Enter 3K Run Time (MM:SS)</label>
        <input
          type="text"
          value={timeString}
          onChange={(e) => setTimeString(e.target.value)}
          placeholder="e.g., 12:00"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <button
        onClick={handleCalculate}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Calculate Score
      </button>
      
      <div className="mt-6">
        <p className="text-lg">
          Your 3K time of <span className="font-semibold">{timeString}</span> gives you an 
          aerobic score of: <span className="font-bold text-xl">{score}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Score interpretation: 100 is excellent, 60 is passing, and 0 is failing.
        </p>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h2 className="font-semibold">How the score is calculated:</h2>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>9:30 or faster: Score = 100</li>
          <li>Between 9:30 and 14:15: Score decreases linearly from 100 to 60</li>
          <li>Between 14:15 and 18:00: Score decreases linearly from 60 to 0</li>
          <li>18:00 or slower: Score = 0</li>
        </ul>
      </div>
    </div>
  );
} 