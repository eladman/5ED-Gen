import React from 'react';
import { Metrics } from '@/app/metrics/page';
import { threeKRunScore, strengthScoreFromString, fourHundredMeterScoreFromString } from "@/lib/fitnessUtils";
import { FaChartLine } from 'react-icons/fa';

interface StartYearMetricsProps {
  userGender?: string;
  yearStartMetrics?: Metrics | null;
}

export default function StartYearMetrics({ userGender = 'male', yearStartMetrics }: StartYearMetricsProps) {
  // If no actual data is provided, use fake metrics data
  const metricsData = yearStartMetrics || {
    run3000m: "14:20",
    run400m: "1:10",
    pullUps: "8",
    pushUps: "25",
    sitUps2min: "45"
  };

  // Calculate scores based on the metrics
  const calculateRating = (value: string, type: string) => {
    if (type === 'run3000m') {
      const [minutes, seconds] = value.split(':').map(Number);
      return threeKRunScore(minutes, seconds, userGender);
    } else if (type === 'run400m') {
      return fourHundredMeterScoreFromString(value, userGender);
    } else if (type === 'strength') {
      return strengthScoreFromString(metricsData.pullUps, metricsData.pushUps, userGender);
    } else {
      return 50; // Default
    }
  };

  // Calculate the scores
  const aerobicScore = calculateRating(metricsData.run3000m, 'run3000m');
  const anaerobicScore = calculateRating(metricsData.run400m, 'run400m');
  const strengthScore = calculateRating('', 'strength');
  
  // Overall score (removed sitUps from calculation)
  const overallScore = Math.round((aerobicScore + anaerobicScore + strengthScore) / 3);

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-lime-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-3 text-white">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-md">
            <FaChartLine className="text-white" size={14} />
          </div>
          <h3 className="font-medium">מדדים תחילת שנה</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Overall Score */}
        <div className="mb-4 flex justify-center">
          <div className="text-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <div className="text-sm font-medium text-gray-500">ציון כללי</div>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
          </div>
        </div>

        {/* Category Scores - Changed from grid-cols-4 to grid-cols-3 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">אירובי</div>
            <div className={`font-medium ${getScoreColor(aerobicScore)}`}>{aerobicScore}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">אנאירובי</div>
            <div className={`font-medium ${getScoreColor(anaerobicScore)}`}>{anaerobicScore}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">כוח</div>
            <div className={`font-medium ${getScoreColor(strengthScore)}`}>{strengthScore}</div>
          </div>
        </div>

        {/* Detailed Metrics - Still keeping all 5 metrics */}
        <div className="grid grid-cols-5 gap-3 bg-gray-50 p-3 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">ריצת 3,000 מטר</div>
            <div className="font-medium">{metricsData.run3000m}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">ריצת 400 מטר</div>
            <div className="font-medium">{metricsData.run400m}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">מתח</div>
            <div className="font-medium">{metricsData.pullUps}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">שכיבות שמיכה</div>
            <div className="font-medium">{metricsData.pushUps}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">בטן 2 דקות</div>
            <div className="font-medium">{metricsData.sitUps2min}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 