'use client';

import { useState } from 'react';
import { pullUpsScoreMaleEasierBreak27, pushUpsScoreMale, strengthScoreMale } from '@/lib/fitnessUtils';

export default function StrengthScoreCalculator() {
  const [pullUps, setPullUps] = useState<number>(9);
  const [pushUps, setPushUps] = useState<number>(30);
  
  const pullUpsScore = pullUpsScoreMaleEasierBreak27(pullUps);
  const pushUpsScore = pushUpsScoreMale(pushUps);
  const strengthScore = strengthScoreMale(pullUps, pushUps);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-4">כוח Strength Score Calculator</h1>
        <p className="text-gray-600 mb-6">
          Tests the new strength scoring system based on 50% pull-ups and 50% push-ups.
        </p>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Pull-Ups Reps: {pullUps}
            </label>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={pullUps}
              onChange={(e) => setPullUps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Push-Ups Reps: {pushUps}
            </label>
            <input
              type="range"
              min="0"
              max="120"
              step="1"
              value={pushUps}
              onChange={(e) => setPushUps(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>30</span>
              <span>60</span>
              <span>90</span>
              <span>120</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <ScoreCard label="Pull-Ups Score" score={pullUpsScore} />
          <ScoreCard label="Push-Ups Score" score={pushUpsScore} />
          <ScoreCard label="Strength Score" score={strengthScore} primary />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold">Pull-Ups Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>0 reps: Score = 0</li>
            <li>1-9 reps: Score = 10-60 (linear)</li>
            <li>10-27 reps: Score = 60-90 (linear)</li>
            <li>28-40 reps: Score = 90-100 (linear)</li>
            <li>40+ reps: Score = 100</li>
          </ul>

          <h2 className="font-semibold mt-4">Push-Ups Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>0 reps: Score = 0</li>
            <li>1-36 reps: Score = 1-60 (linear)</li>
            <li>37-119 reps: Score = 60-100 (linear)</li>
            <li>120+ reps: Score = 100</li>
          </ul>

          <h2 className="font-semibold mt-4">Strength Score Formula:</h2>
          <ul className="text-sm text-gray-600 space-y-1 mt-2">
            <li>50% of Pull-Ups Score + 50% of Push-Ups Score</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, primary = false }: { label: string; score: number; primary?: boolean }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div 
      className={`p-4 rounded-lg ${primary ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
    >
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
    </div>
  );
} 