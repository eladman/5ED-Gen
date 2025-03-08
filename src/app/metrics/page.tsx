"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Navbar from "@/app/components/Navbar";
import { FaRunning, FaDumbbell, FaStopwatch, FaPlus, FaTrash } from "react-icons/fa";
import { GiSittingDog } from "react-icons/gi";
import toast from "react-hot-toast";
import { addDocument, getDocuments, deleteDocument } from "@/lib/firebase/firebaseUtils";

interface MetricsForm {
  run3000m: string;
  pullUps: string;
  pushUps: string;
  run400m: string;
  sitUps2min: string;
}

interface Metrics extends MetricsForm {
  id: string;
  userId: string;
  createdAt: string;
}

export default function MetricsPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [metrics, setMetrics] = useState<MetricsForm>({
    run3000m: "",
    pullUps: "",
    pushUps: "",
    run400m: "",
    sitUps2min: "",
  });
  const [previousMetrics, setPreviousMetrics] = useState<Metrics[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      try {
        const docs = await getDocuments<Metrics>('metrics');
        const userMetrics = docs
          .filter(doc => doc.userId === user.uid)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPreviousMetrics(userMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error('אירעה שגיאה בטעינת המדדים');
      }
    };

    fetchMetrics();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loadingToast = toast.loading('שומר מדדים...') as string;

      // Check if all fields are filled
      const isAllFieldsFilled = Object.values(metrics).every(value => value !== "");
      if (!isAllFieldsFilled) {
        toast.error('יש למלא את כל המדדים לפני השמירה', { id: loadingToast });
        return;
      }
      
      // Validate time format for running metrics
      const timeRegex = /^\d{1,2}:\d{2}$/;
      if (!timeRegex.test(metrics.run3000m)) {
        toast.error('פורמט זמן לא תקין עבור ריצת 3,000 מטר (דק:שנ)', { id: loadingToast });
        return;
      }
      if (!timeRegex.test(metrics.run400m)) {
        toast.error('פורמט זמן לא תקין עבור ריצת 400 מטר (דק:שנ)', { id: loadingToast });
        return;
      }

      // Add timestamp and user ID to metrics
      const metricsData = {
        ...metrics,
        userId: user?.uid,
        createdAt: new Date().toISOString(),
      };

      // Save to Firebase
      const savedMetric = await addDocument('metrics', metricsData);
      
      // Update local state
      setPreviousMetrics(prev => [{ ...metricsData, id: savedMetric.id } as Metrics, ...prev]);
      
      // Reset form
      setMetrics({
        run3000m: "",
        pullUps: "",
        pushUps: "",
        run400m: "",
        sitUps2min: "",
      });
      setCurrentStep(1);
      setShowForm(false);

      toast.success('המדדים נשמרו בהצלחה!', { id: loadingToast });
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('אירעה שגיאה בשמירת המדדים');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = async (metricId: string) => {
    try {
      const loadingToast = toast.loading('מוחק מדד...') as string;
      
      // Delete from Firebase
      await deleteDocument('metrics', metricId);
      
      // Update local state
      setPreviousMetrics(prev => prev.filter(metric => metric.id !== metricId));
      
      toast.success('המדד נמחק בהצלחה!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('אירעה שגיאה במחיקת המדד');
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container-custom min-h-screen pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">יש להתחבר כדי לצפות בדף זה</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container-custom min-h-screen pt-32 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              המדדים <span className="text-gradient">שלי</span>
            </h1>
            <div className="w-24 h-1 bg-[#ff8714] mx-auto rounded-full"></div>
          </div>

          {!showForm && (
            <div className="space-y-6">
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-[#ff8714] text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-[#e67200] focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:ring-offset-2 transition-colors"
                >
                  <FaPlus className="w-5 h-5" />
                  הוסף מדדים חדשים
                </button>
              </div>

              {previousMetrics.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 text-lg">עדיין לא נשמרו מדדים</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {previousMetrics.map((metric) => (
                    <div key={metric.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-[#ff8714] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-sm text-gray-500">{formatDate(metric.createdAt)}</div>
                        <button
                          onClick={() => handleDelete(metric.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                          title="מחק מדד"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaRunning className="w-5 h-5" />
                            <span>ריצת 3,000 מטר:</span>
                            <span className="font-mono">{metric.run3000m}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaRunning className="w-5 h-5" />
                            <span>ריצת 400 מטר:</span>
                            <span className="font-mono">{metric.run400m}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaDumbbell className="w-5 h-5" />
                            <span>מתח:</span>
                            <span>{metric.pullUps}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaDumbbell className="w-5 h-5" />
                            <span>שכיבות סמיכה:</span>
                            <span>{metric.pushUps}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <GiSittingDog className="w-5 h-5" />
                            <span>כפיפות בטן:</span>
                            <span>{metric.sitUps2min}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showForm && (
            <>
              {/* Progress Bar */}
              <div className="relative pt-8 mb-12">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="absolute h-full bg-[#ff8714] rounded-full transition-all"
                    style={{ width: `${(currentStep / 3) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { step: 1, label: 'מדדי ריצה' },
                    { step: 2, label: 'מדדי כוח' },
                    { step: 3, label: 'מדדי ליבה' }
                  ].map((item) => (
                    <div
                      key={item.step}
                      className={`flex flex-col items-center pt-6 ${
                        currentStep >= item.step ? 'text-[#ff8714]' : 'text-gray-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full mb-2 ${
                        currentStep >= item.step ? 'bg-[#ff8714]' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Running Metrics */}
                {currentStep === 1 && (
                  <div className="bg-blue-50 p-8 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaRunning className="w-8 h-8 text-blue-500" />
                      <h2 className="text-2xl font-semibold">מדדי ריצה</h2>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaRunning className="w-6 h-6" />
                            <span>זמן ריצת 3,000 מטר</span>
                            <FaStopwatch className="w-6 h-6" />
                          </div>
                        </label>
                        <div className="flex justify-center items-center gap-2 rtl">
                          <input
                            type="text"
                            placeholder="שניות"
                            value={metrics.run3000m.split(':')[1] || ''}
                            onChange={(e) => {
                              const seconds = e.target.value;
                              const minutes = metrics.run3000m.split(':')[0] || '0';
                              if (/^\d{0,2}$/.test(seconds)) {
                                setMetrics(prev => ({
                                  ...prev,
                                  run3000m: `${minutes}:${seconds}`
                                }));
                              }
                            }}
                            className="w-20 text-center text-xl font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            maxLength={2}
                          />
                          <span className="text-2xl font-mono">:</span>
                          <input
                            type="text"
                            placeholder="דקות"
                            value={metrics.run3000m.split(':')[0] || ''}
                            onChange={(e) => {
                              const minutes = e.target.value;
                              const seconds = metrics.run3000m.split(':')[1] || '00';
                              if (/^\d{0,2}$/.test(minutes)) {
                                setMetrics(prev => ({
                                  ...prev,
                                  run3000m: `${minutes}:${seconds}`
                                }));
                              }
                            }}
                            className="w-20 text-center text-xl font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            maxLength={2}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaRunning className="w-6 h-6" />
                            <span>זמן ריצת 400 מטר</span>
                            <FaStopwatch className="w-6 h-6" />
                          </div>
                        </label>
                        <div className="flex justify-center items-center gap-2 rtl">
                          <input
                            type="text"
                            placeholder="שניות"
                            value={metrics.run400m.split(':')[1] || ''}
                            onChange={(e) => {
                              const seconds = e.target.value;
                              const minutes = metrics.run400m.split(':')[0] || '0';
                              if (/^\d{0,2}$/.test(seconds)) {
                                setMetrics(prev => ({
                                  ...prev,
                                  run400m: `${minutes}:${seconds}`
                                }));
                              }
                            }}
                            className="w-20 text-center text-xl font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            maxLength={2}
                          />
                          <span className="text-2xl font-mono">:</span>
                          <input
                            type="text"
                            placeholder="דקות"
                            value={metrics.run400m.split(':')[0] || ''}
                            onChange={(e) => {
                              const minutes = e.target.value;
                              const seconds = metrics.run400m.split(':')[1] || '00';
                              if (/^\d{0,2}$/.test(minutes)) {
                                setMetrics(prev => ({
                                  ...prev,
                                  run400m: `${minutes}:${seconds}`
                                }));
                              }
                            }}
                            className="w-20 text-center text-xl font-mono bg-white border-2 border-gray-300 rounded-lg p-2 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Strength Metrics */}
                {currentStep === 2 && (
                  <div className="bg-orange-50 p-8 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <FaDumbbell className="w-8 h-8 text-orange-500" />
                      <h2 className="text-2xl font-semibold">מדדי כוח</h2>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaDumbbell className="w-6 h-6" />
                            <span>מתח</span>
                          </div>
                        </label>
                        <div className="flex justify-center items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setMetrics(prev => ({
                              ...prev,
                              pullUps: String(Math.max(0, parseInt(prev.pullUps || '0') - 1))
                            }))}
                            className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 text-2xl flex items-center justify-center hover:bg-gray-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            name="pullUps"
                            value={metrics.pullUps}
                            onChange={handleChange}
                            className="w-24 text-center text-3xl font-bold bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => setMetrics(prev => ({
                              ...prev,
                              pullUps: String(parseInt(prev.pullUps || '0') + 1)
                            }))}
                            className="w-12 h-12 rounded-full bg-[#ff8714] text-white text-2xl flex items-center justify-center hover:bg-[#e67200]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <FaDumbbell className="w-6 h-6" />
                            <span>שכיבות סמיכה</span>
                          </div>
                        </label>
                        <div className="flex justify-center items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setMetrics(prev => ({
                              ...prev,
                              pushUps: String(Math.max(0, parseInt(prev.pushUps || '0') - 1))
                            }))}
                            className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 text-2xl flex items-center justify-center hover:bg-gray-200"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            name="pushUps"
                            value={metrics.pushUps}
                            onChange={handleChange}
                            className="w-24 text-center text-3xl font-bold bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            onClick={() => setMetrics(prev => ({
                              ...prev,
                              pushUps: String(parseInt(prev.pushUps || '0') + 1)
                            }))}
                            className="w-12 h-12 rounded-full bg-[#ff8714] text-white text-2xl flex items-center justify-center hover:bg-[#e67200]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Core Metrics */}
                {currentStep === 3 && (
                  <div className="bg-green-50 p-8 rounded-xl space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <GiSittingDog className="w-8 h-8 text-green-500" />
                      <h2 className="text-2xl font-semibold">מדדי ליבה</h2>
                    </div>

                    <div>
                      <label className="block text-xl font-medium text-gray-700 mb-4">
                        <div className="flex items-center justify-center gap-2">
                          <GiSittingDog className="w-6 h-6" />
                          <span>כפיפות בטן ב-2 דקות</span>
                        </div>
                      </label>
                      <div className="flex justify-center items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setMetrics(prev => ({
                            ...prev,
                            sitUps2min: String(Math.max(0, parseInt(prev.sitUps2min || '0') - 1))
                          }))}
                          className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 text-2xl flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          name="sitUps2min"
                          value={metrics.sitUps2min}
                          onChange={handleChange}
                          className="w-24 text-center text-3xl font-bold bg-white border-2 border-gray-300 rounded-lg p-3 hover:border-[#ff8714] focus:border-[#ff8714] focus:ring-1 focus:ring-[#ff8714] focus:outline-none"
                          placeholder="0"
                        />
                        <button
                          type="button"
                          onClick={() => setMetrics(prev => ({
                            ...prev,
                            sitUps2min: String(parseInt(prev.sitUps2min || '0') + 1)
                          }))}
                          className="w-12 h-12 rounded-full bg-[#ff8714] text-white text-2xl flex items-center justify-center hover:bg-[#e67200]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl text-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
                    >
                      חזור
                    </button>
                  )}
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-[#ff8714] text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-[#e67200] focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:ring-offset-2 transition-colors"
                    >
                      המשך
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex-1 bg-[#ff8714] text-white py-3 px-6 rounded-xl text-lg font-medium hover:bg-[#e67200] focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:ring-offset-2 transition-colors"
                    >
                      שמור מדדים
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
} 