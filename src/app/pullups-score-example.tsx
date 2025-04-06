'use client';

import { useState } from 'react';
import { pullUpsScoreMaleEasierBreak27, pullUpsScoreFemale } from '@/lib/fitnessUtils';

interface ScoreCardProps {
  label: string;
  score: number;
  primary?: boolean;
}

function ScoreCard({ label, score, primary = false }: ScoreCardProps) {
  return (
    <div className={`p-4 rounded-lg ${primary ? 'bg-[#ff8714] text-white' : 'bg-white border border-gray-200'} text-center`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className={`text-2xl font-bold ${primary ? 'text-white' : ''}`}>{score}</div>
    </div>
  );
}

export default function PullUpsScoreCalculator() {
  const [pullUps, setPullUps] = useState<number>(5);
  const [gender, setGender] = useState<'male' | 'female'>('female');
  
  const maleScore = pullUpsScoreMaleEasierBreak27(pullUps);
  const femaleScore = pullUpsScoreFemale(pullUps);
  const currentScore = gender === 'female' ? femaleScore : maleScore;

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Pull-Ups Score Calculator</h1>
        <p className="text-gray-600 mb-6">
          Compare pull-ups scoring between male and female athletes
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGender('male')}
              className={`py-2 px-4 rounded-md ${
                gender === 'male' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`py-2 px-4 rounded-md ${
                gender === 'female' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Pull-Ups Reps: {pullUps}
            </label>
            <input
              type="range"
              min="0"
              max={gender === 'female' ? 15 : 40}
              step="1"
              value={pullUps}
              onChange={(e) => setPullUps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              {gender === 'female' ? (
                <>
                  <span>5</span>
                  <span>10</span>
                  <span>15</span>
                </>
              ) : (
                <>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <ScoreCard label="Male Score" score={maleScore} />
          <ScoreCard label="Female Score" score={femaleScore} />
          <ScoreCard label="Current Score" score={currentScore} primary />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold">Male Pull-Ups Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>0 reps: Score = 0</li>
            <li>1-9 reps: Score = 10-60 (linear)</li>
            <li>10-27 reps: Score = 60-90 (linear)</li>
            <li>28-40 reps: Score = 90-100 (linear)</li>
            <li>40+ reps: Score = 100</li>
          </ul>

          <h2 className="font-semibold mt-4">Female Pull-Ups Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>0 reps: Score = 0</li>
            <li>1 rep: Score = 55</li>
            <li>2 reps: Score = 60</li>
            <li>3-9 reps: Score = 64-86 (linear with slope 3.75)</li>
            <li>10-14 reps: Score = 90-98 (linear with slope 2)</li>
            <li>15+ reps: Score = 100</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 