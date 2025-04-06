'use client';

import { useState } from 'react';
import { 
  pullUpsScoreMaleEasierBreak27,
  pullUpsScoreFemale,
  pushUpsScoreMale, 
  pushUpsScoreFemale, 
  strengthScoreMale 
} from '@/lib/fitnessUtils';

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

export default function StrengthScoreCalculator() {
  const [pullUps, setPullUps] = useState<number>(5);
  const [pushUps, setPushUps] = useState<number>(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  
  const pullUpsScore = gender === 'female' 
    ? pullUpsScoreFemale(pullUps) 
    : pullUpsScoreMaleEasierBreak27(pullUps);
  
  const pushUpsScore = gender === 'female'
    ? pushUpsScoreFemale(pushUps)
    : pushUpsScoreMale(pushUps);
  
  const strengthScore = strengthScoreMale(pullUps, pushUps, gender);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Strength Score Calculator</h1>
        <p className="text-gray-600 mb-6">
          Tests the strength scoring system based on pull-ups and push-ups with gender-specific formulas.
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

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Push-Ups Reps: {pushUps}
            </label>
            <input
              type="range"
              min="0"
              max={gender === 'female' ? 80 : 120}
              step="1"
              value={pushUps}
              onChange={(e) => setPushUps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              {gender === 'female' ? (
                <>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                </>
              ) : (
                <>
                  <span>30</span>
                  <span>60</span>
                  <span>90</span>
                  <span>120</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <ScoreCard label="Pull-Ups Score" score={pullUpsScore} />
          <ScoreCard label="Push-Ups Score" score={pushUpsScore} />
          <ScoreCard label="Strength Score" score={strengthScore} primary />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mt-4">Pull-Ups Score Formulas:</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h3 className="text-sm font-medium text-blue-600">Male</h3>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>0 reps: 0 points</li>
                <li>1-9 reps: 10-60 points</li>
                <li>10-27 reps: 60-90 points</li>
                <li>28-40 reps: 90-100 points</li>
                <li>40+ reps: 100 points</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-pink-600">Female</h3>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>0 reps: 0 points</li>
                <li>1 rep: 55 points</li>
                <li>2 reps: 60 points</li>
                <li>3-9 reps: 64-86 points</li>
                <li>10-14 reps: 90-98 points</li>
                <li>15+ reps: 100 points</li>
              </ul>
            </div>
          </div>

          <h2 className="font-semibold mt-4">Push-Ups Score Formulas:</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <h3 className="text-sm font-medium text-blue-600">Male</h3>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>0 reps: 0 points</li>
                <li>1-36 reps: 1-60 points</li>
                <li>37-119 reps: 60-100 points</li>
                <li>120+ reps: 100 points</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-pink-600">Female</h3>
              <ul className="text-sm text-gray-600 space-y-1 mt-1">
                <li>0 reps: 0 points</li>
                <li>1-9 reps: 4-36 points</li>
                <li>10-19 reps: 40-58 points</li>
                <li>20-39 reps: 60-79 points</li>
                <li>40-79 reps: 80-99 points</li>
                <li>80+ reps: 100 points</li>
              </ul>
            </div>
          </div>

          <h2 className="font-semibold mt-4">Strength Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>50% of Pull-Ups Score + 50% of Push-Ups Score</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 