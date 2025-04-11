import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaRunning, FaStopwatch, FaDumbbell } from 'react-icons/fa';

// Define MetricsForm locally as it's not exported from the page
interface MetricsForm {
  run3000m: string;
  pullUps: string;
  pushUps: string;
  run400m: string;
  sitUps2min: string;
}

interface YearStartMetricsFormProps {
  onSubmit: (data: MetricsForm) => Promise<boolean>;
  onCancel: () => void;
}

const YearStartMetricsForm: React.FC<YearStartMetricsFormProps> = ({ onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [metricsData, setMetricsData] = useState<MetricsForm>({
    run3000m: "",
    pullUps: "",
    pushUps: "",
    run400m: "",
    sitUps2min: "",
  });
  const [timeInputs, setTimeInputs] = useState({
    run3000m: { minutes: "", seconds: "" },
    run400m: { minutes: "", seconds: "" }
  });

  // --- Internal State Handlers ---
  const handleTimeChange = useCallback((metricName: 'run3000m' | 'run400m', field: 'minutes' | 'seconds', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (field === 'minutes' && value !== '' && parseInt(value) > 99) return;
    if (field === 'seconds' && value !== '' && parseInt(value) > 59) return;
    
    setTimeInputs(prev => ({
      ...prev,
      [metricName]: {
        ...prev[metricName],
        [field]: value
      }
    }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pullUps' || name === 'pushUps' || name === 'sitUps2min') {
      const numValue = value === '' ? '' : Math.max(0, parseInt(value)).toString();
      setMetricsData((prev: MetricsForm) => ({ ...prev, [name]: numValue }));
    } else {
      // This case shouldn't be hit for runs as they are handled by handleTimeChange
      // But providing a fallback just in case.
      setMetricsData((prev: MetricsForm) => ({ ...prev, [name]: value }));
    }
  }, []);

  // --- Navigation --- 
  const nextStep = () => {
    if (currentStep === 1) {
      const run3000Time = `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`;
      if (run3000Time === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const run400Time = `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`;
      if (run400Time === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 400 מטר');
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const selectStep = (step: number) => {
     if (step > currentStep) {
      if (currentStep === 1) {
        const run3000Time = `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`;
        if (run3000Time === "0:00") {
          toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר');
          return;
        }
      }
      if (currentStep === 2 && step > 2) {
        const run400Time = `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`;
        if (run400Time === "0:00") {
          toast.error('יש להזין זמן תקין עבור ריצת 400 מטר');
          return;
        }
      }
    }
    setCurrentStep(step);
  };

  // --- Final Submit --- 
  const handleFinalSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Format time inputs
    const formattedMetrics = {
      ...metricsData,
      run3000m: `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`,
      run400m: `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`,
    };

    // Validate all fields before calling onSubmit
    if (formattedMetrics.run3000m === "0:00") {
      toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר');
      return;
    }
    if (formattedMetrics.run400m === "0:00") {
      toast.error('יש להזין זמן תקין עבור ריצת 400 מטר');
      return;
    }
    if (!formattedMetrics.pullUps) {
      toast.error('יש להזין את מספר המתחים');
      return;
    }
    if (!formattedMetrics.pushUps) {
      toast.error('יש להזין את מספר השכיבות שמיכה');
      return;
    }
    if (!formattedMetrics.sitUps2min) {
      toast.error('יש להזין את מספר הבטן');
      return;
    }

    // Call the passed onSubmit function
    const success = await onSubmit(formattedMetrics);
    // The parent component will handle closing this form if success is true
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-8 shadow-xl border border-gray-200 animate-slideUp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">הזנת מדדים - תחילת שנה</h2>
        <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all ${
                currentStep === step 
                  ? 'bg-[#ff8714] text-white' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              onClick={(e) => {
                e.preventDefault();
                selectStep(step);
              }}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
      
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Step 1 - Aerobic */} 
        {currentStep === 1 && (
           <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff8714]/10 mb-2">
                <FaRunning className="text-[#ff8714] w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">סיבולת אירובית</h3>
              <p className="text-gray-500 text-sm">הזן את זמן ריצת 3,000 מטר מתחילת השנה</p>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <label className="block text-sm font-medium">ריצת 3,000 מטר (דק:שנ)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={timeInputs.run3000m.seconds}
                    onChange={(e) => handleTimeChange('run3000m', 'seconds', e.target.value)}
                    placeholder="שניות"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                    maxLength={2}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">שנ'</span>
                  </div>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={timeInputs.run3000m.minutes}
                    onChange={(e) => handleTimeChange('run3000m', 'minutes', e.target.value)}
                    placeholder="דקות"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                    maxLength={2}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">דק'</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Anaerobic */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff8714]/10 mb-2">
                <FaStopwatch className="text-[#ff8714] w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">סיבולת אנאירובית</h3>
              <p className="text-gray-500 text-sm">הזן את זמן ריצת 400 מטר מתחילת השנה</p>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <label className="block text-sm font-medium">ריצת 400 מטר (דק:שנ)</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={timeInputs.run400m.seconds}
                    onChange={(e) => handleTimeChange('run400m', 'seconds', e.target.value)}
                    placeholder="שניות"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                    maxLength={2}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">שנ'</span>
                  </div>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={timeInputs.run400m.minutes}
                    onChange={(e) => handleTimeChange('run400m', 'minutes', e.target.value)}
                    placeholder="דקות"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                    maxLength={2}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">דק'</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Strength */} 
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff8714]/10 mb-2">
                <FaDumbbell className="text-[#ff8714] w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium">כוח</h3>
              <p className="text-gray-500 text-sm">הזן את תוצאות תרגילי הכוח מתחילת השנה</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium">מתח (חזרות)</label>
                <input
                  type="number"
                  name="pullUps"
                  value={metricsData.pullUps}
                  onChange={handleChange}
                  placeholder="למשל: 10"
                  min="0"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">שכיבות שמיכה (חזרות)</label>
                <input
                  type="number"
                  name="pushUps"
                  value={metricsData.pushUps}
                  onChange={handleChange}
                  placeholder="למשל: 20"
                  min="0"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">בטן (חזרות ב-2 דקות)</label>
                <input
                  type="number"
                  name="sitUps2min"
                  value={metricsData.sitUps2min}
                  onChange={handleChange}
                  placeholder="למשל: 40"
                  min="0"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <span>חזור</span>
              </button>
            )}
            <button
              type="button"
              onClick={onCancel} // Use the passed onCancel prop
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <span>ביטול</span>
            </button>
          </div>
          
          <div className="w-24 text-right">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); nextStep(); }}
                className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
              >
                <span>הבא</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit} // Call the validation and submit handler
                className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
              >
                <span>המשך</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default YearStartMetricsForm; 