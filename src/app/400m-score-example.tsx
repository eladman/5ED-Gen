'use client';

import { useState } from 'react';
import { fourHundredMeterScoreMale } from '@/lib/fitnessUtils';

export default function FourHundredMeterScoreCalculator() {
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(20);
  
  const totalSeconds = minutes * 60 + seconds;
  const score = fourHundredMeterScoreMale(minutes, seconds);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">400-Meter Run Score Calculator</h1>
        <p className="text-gray-600 mb-6">
          Tests the new 400m run scoring system for males.
        </p>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Time: {minutes}:{seconds.toString().padStart(2, '0')} (Total: {totalSeconds} seconds)
            </label>
            <input
              type="range"
              min="55"
              max="120"
              step="1"
              value={totalSeconds}
              onChange={(e) => {
                const total = parseInt(e.target.value);
                setMinutes(Math.floor(total / 60));
                setSeconds(total % 60);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:55</span>
              <span>1:10</span>
              <span>1:25</span>
              <span>1:40</span>
              <span>2:00</span>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-blue-50 border border-blue-200">
            <div className="text-center">
              <div className="text-sm text-gray-600">400m Run Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold">400m Run Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>0:55 or faster: Score = 100</li>
            <li>0:55 to 1:00: Score = 100-90 (drops by 2 points per second)</li>
            <li>1:00 to 1:20: Score = 90-60 (drops by 1.5 points per second)</li>
            <li>1:20 to 2:00: Score = 60-0 (drops by 1.5 points per second)</li>
            <li>2:00 or slower: Score = 0</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-red-500';
} 