import { FaPencilAlt, FaTrash, FaRunning, FaBolt, FaDumbbell, FaChartLine, FaPlus } from 'react-icons/fa';
import { Metrics } from '@/app/metrics/page';
import { threeKRunScore, strengthScoreFromString, fourHundredMeterScoreFromString } from "@/lib/fitnessUtils";

interface MetricsPastCardProps {
  metrics?: Metrics | null;
  onEdit: () => void;
  onDelete?: () => void;
  onAdd?: () => void;
  userGender?: string;
}

export default function MetricsPastCard({ 
  metrics, 
  onEdit, 
  onDelete, 
  onAdd,
  userGender = 'male' 
}: MetricsPastCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // If no metrics, show an "Add" card
  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-3 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-md">
              <FaChartLine className="text-white" size={14} />
            </div>
            <h3 className="font-medium">מדדים 2024</h3>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center justify-center">
          <p className="text-slate-500 mb-4 text-center text-sm">אין מדדים לשנת 2024</p>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-[#ff8714] text-white rounded-full font-medium hover:bg-[#e67200] transition-colors flex items-center gap-2 text-sm"
          >
            <FaPlus size={12} /> הוסף מדדים
          </button>
        </div>
      </div>
    );
  }

  // Calculate scores
  const calculateRating = (value: string, type: 'time' | 'reps', metricType?: string) => {
    if (type === 'time') {
      const [minutes, seconds] = value.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds;
      
      if (isNaN(totalSeconds)) return 0;
      
      // For 3000m run - use the threeKRunScore function with gender
      if (metricType === '3000m' || value === metrics.run3000m) {
        return threeKRunScore(minutes, seconds, userGender);
      }
      
      // For 400m run (lower is better)
      if (metricType === '400m' || value === metrics.run400m) {
        if (totalSeconds < 60) return 99; // Under 1 minute is exceptional
        if (totalSeconds > 180) return 40; // Over 3 minutes is below average
        
        // Linear scale between 1 and 3 minutes
        return Math.round(99 - ((totalSeconds - 60) / 120) * 59);
      }
      
      return 50; // Default
    } else {
      // For reps (higher is better)
      const reps = parseInt(value);
      if (isNaN(reps)) return 0;
      
      // Pull-ups
      if (metricType === 'pullUps' || value === metrics.pullUps) {
        if (reps > 20) return 99;
        if (reps < 1) return 40;
        return Math.round(40 + (reps / 20) * 59);
      }
      
      // Push-ups
      if (metricType === 'pushUps' || value === metrics.pushUps) {
        if (reps > 50) return 99;
        if (reps < 5) return 40;
        return Math.round(40 + (reps / 50) * 59);
      }
      
      // Sit-ups
      if (metricType === 'sitUps' || value === metrics.sitUps2min) {
        if (reps > 70) return 99;
        if (reps < 10) return 40;
        return Math.round(40 + (reps / 70) * 59);
      }
      
      return 50; // Default
    }
  };

  // Calculate category ratings
  const aerobicRating = threeKRunScore(
    parseInt(metrics.run3000m.split(':')[0] || '0'), 
    parseInt(metrics.run3000m.split(':')[1] || '0'), 
    userGender
  );
  const anaerobicRating = fourHundredMeterScoreFromString(metrics.run400m, userGender);
  const strengthRating = strengthScoreFromString(metrics.pullUps, metrics.pushUps, userGender);
  
  // Sit-ups rating as a separate category
  const sitUpsRating = calculateRating(metrics.sitUps2min, 'reps', 'sitUps');

  // Overall rating calculation 
  const overallRating = Math.round(
    (aerobicRating + anaerobicRating + strengthRating + sitUpsRating) / 4
  );

  // Get rating color based on value
  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-green-500";
    if (rating >= 80) return "text-green-400";
    if (rating >= 70) return "text-lime-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 50) return "text-orange-500";
    return "text-red-500";
  };

  // Get rating background color based on value
  const getRatingBgColor = (rating: number) => {
    if (rating >= 90) return "bg-green-50";
    if (rating >= 80) return "bg-green-50";
    if (rating >= 70) return "bg-lime-50";
    if (rating >= 60) return "bg-yellow-50";
    if (rating >= 50) return "bg-orange-50";
    return "bg-red-50";
  };

  // Get accent color for visual elements
  const getAccentColor = (rating: number) => {
    if (rating >= 90) return "#22c55e"; // green-500
    if (rating >= 80) return "#4ade80"; // green-400
    if (rating >= 70) return "#84cc16"; // lime-500
    if (rating >= 60) return "#eab308"; // yellow-500
    if (rating >= 50) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Card Header with Gradient */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-3 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-md">
            <FaChartLine className="text-white" size={14} />
          </div>
          <h3 className="font-medium">מדדים 2024</h3>
        </div>
        <div className="flex space-x-0 gap-2 rtl:space-x-reverse">
          {onDelete && (
            <button 
              onClick={onDelete}
              className="text-white/80 hover:text-red-300 hover:bg-white/10 transition-colors p-1.5 rounded-full"
              aria-label="מחק מדדים"
            >
              <FaTrash size={12} />
            </button>
          )}
          <button 
            onClick={onEdit}
            className="text-white/80 hover:text-white hover:bg-white/10 transition-colors p-1.5 rounded-full"
            aria-label="ערוך מדדים"
          >
            <FaPencilAlt size={12} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Overall Score - Featured Score */}
        <div className="mb-4 flex justify-center">
          <div 
            className={`w-20 h-20 rounded-full flex items-center justify-center ${getRatingBgColor(overallRating)} relative`}
            style={{ boxShadow: `0 0 0 4px white, 0 0 0 5px ${getAccentColor(overallRating)}30` }}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRatingColor(overallRating)}`}>
                {overallRating}
              </div>
              <div className="text-xs text-slate-500 font-medium">ציון כללי</div>
            </div>
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                background: `conic-gradient(${getAccentColor(overallRating)} ${overallRating}%, transparent 0)`,
                opacity: 0.15
              }}
            />
          </div>
        </div>
        
        {/* Category Scores - Horizontal Score Bar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <ScoreCategory 
            label="אירובי" 
            score={aerobicRating} 
            icon={<FaRunning size={10} />} 
            getColor={getRatingColor} 
            getBgColor={getRatingBgColor} 
          />
          <ScoreCategory 
            label="אנאירובי" 
            score={anaerobicRating} 
            icon={<FaBolt size={10} />} 
            getColor={getRatingColor} 
            getBgColor={getRatingBgColor} 
          />
          <ScoreCategory 
            label="כוח" 
            score={strengthRating} 
            icon={<FaDumbbell size={10} />} 
            getColor={getRatingColor} 
            getBgColor={getRatingBgColor} 
          />
        </div>
        
        {/* Detailed Metrics Section with Improved Layout */}
        <div className="grid grid-cols-5 gap-3 mt-3 text-xs bg-gray-50 p-2 rounded-lg">
          <div className="text-center py-1">
            <div className="text-gray-500 mb-1 text-[10px]">ריצת 3,000 מטר</div>
            <div className="font-medium">{metrics.run3000m}</div>
          </div>
          
          <div className="text-center py-1">
            <div className="text-gray-500 mb-1 text-[10px]">ריצת 400 מטר</div>
            <div className="font-medium">{metrics.run400m}</div>
          </div>
          
          <div className="text-center py-1">
            <div className="text-gray-500 mb-1 text-[10px]">מתח</div>
            <div className="font-medium">{metrics.pullUps}</div>
          </div>
          
          <div className="text-center py-1">
            <div className="text-gray-500 mb-1 text-[10px]">שכיבות שמיכה</div>
            <div className="font-medium">{metrics.pushUps}</div>
          </div>
          
          <div className="text-center py-1">
            <div className="text-gray-500 mb-1 text-[10px]">בטן 2 דקות</div>
            <div className="font-medium">{metrics.sitUps2min}</div>
          </div>
        </div>
        
        <div className="text-[10px] text-right mt-3 text-gray-400">
          עודכן ב-{formatDate(metrics.createdAt)}
        </div>
      </div>
    </div>
  );
}

// Score category component for better reusability
function ScoreCategory({ 
  label, 
  score, 
  icon, 
  getColor, 
  getBgColor 
}: { 
  label: string; 
  score: number; 
  icon: React.ReactNode; 
  getColor: (score: number) => string;
  getBgColor: (score: number) => string;
}) {
  return (
    <div className={`${getBgColor(score)} p-2 rounded-lg text-center relative overflow-hidden`}>
      <div className="relative z-10">
        <div className="flex justify-center items-center gap-1 mb-1">
          <span className={`${getColor(score)}`}>{icon}</span>
          <span className="text-xs text-gray-600">{label}</span>
        </div>
        <div className={`text-sm font-bold ${getColor(score)}`}>
          {score}
        </div>
      </div>
      <div 
        className="absolute bottom-0 left-0 h-1.5 transition-all" 
        style={{ 
          width: `${score}%`, 
          backgroundColor: score >= 90 ? '#22c55e' : 
                           score >= 80 ? '#4ade80' : 
                           score >= 70 ? '#84cc16' : 
                           score >= 60 ? '#eab308' : 
                           score >= 50 ? '#f97316' : '#ef4444' 
        }}
      />
    </div>
  );
} 