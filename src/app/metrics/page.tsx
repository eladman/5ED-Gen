"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { FaRunning, FaDumbbell, FaStopwatch, FaPlus, FaTrash, FaUsers, FaChartBar } from "react-icons/fa";
import { GiSittingDog } from "react-icons/gi";
import toast from "react-hot-toast";
import { addDocument, getDocuments, deleteDocument } from "@/lib/firebase/firebaseUtils";
import MetricsFifaCard from "@/app/components/MetricsFifaCard";
import MetricsComparison, { MetricsComparisonProps } from "@/app/components/MetricsComparison";
import { getProfile } from "@/lib/firebase/profileUtils";
import { getTeamNameById } from '@/lib/teamUtils';
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface MetricsForm {
  run3000m: string;
  pullUps: string;
  pushUps: string;
  run400m: string;
  sitUps2min: string;
}

export interface Metrics extends MetricsForm {
  id: string;
  userId: string;
  createdAt: string;
}


export default function MetricsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'social'>('personal');
  const [metrics, setMetrics] = useState<MetricsForm>({
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
  const [previousMetrics, setPreviousMetrics] = useState<Metrics[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<string>("כיתה א");
  const [userGender, setUserGender] = useState<string>("male");
  const [userTeamType, setUserTeamType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check user authentication and profile completion
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const checkProfile = async () => {
      try {
        const profile = await getProfile(user.uid);
        if (!profile || !profile.name || !profile.phone || !profile.team) {
          // Profile doesn't exist or is incomplete, redirect to profile page
          router.push("/profile");
        } else {
          // Store user gender from profile
          setUserGender((profile as any).gender || "male");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        // In case of error, still redirect to profile to be safe
        router.push("/profile");
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfile();
  }, [user, router]);

  // Load user metrics
  useEffect(() => {
    if (!user || isCheckingProfile) return;
    
    const loadUserMetrics = async () => {
      console.log("Starting to load user metrics");
      try {
        setIsLoading(true);
        
        // Get user profile for name and photo
        const profile = await getProfile(user.uid);
        console.log("Loaded user profile:", profile ? "success" : "not found");
        
        if (profile) {
          setUserName(profile.name || user.displayName || "");
          setUserGroup(profile.group || "כיתה א");
          setUserGender((profile as any).gender || "male");
          setUserTeamType(profile.teamType || "");
          if (profile.photoData) {
            setUserPhoto(profile.photoData);
          } else if (profile.photoURL) {
            setUserPhoto(profile.photoURL);
          } else if (user.photoURL) {
            setUserPhoto(user.photoURL);
          }
        }
        
        // Get user metrics from Firestore
        console.log("Fetching metrics for user:", user.uid);
        const metricsRef = collection(db, "metrics");
        const q = query(
          metricsRef,
          where("userId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Metrics query returned size:", querySnapshot.size);
        
        const metricsData: Metrics[] = [];
        
        querySnapshot.forEach((doc) => {
          console.log("Processing metric document:", doc.id);
          metricsData.push({
            id: doc.id,
            ...doc.data()
          } as Metrics);
        });
        
        // Sort by createdAt on the client-side
        metricsData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        console.log("Total metrics loaded:", metricsData.length);
        setPreviousMetrics(metricsData);
        
        // If there are metrics, pre-fill form with most recent values
        if (metricsData.length > 0) {
          console.log("Pre-filling form with latest metrics");
          const latestMetrics = metricsData[0];
          
          // Pre-fill the form if the user wants to add a new entry
          // For 3K run
          const [run3000mMinutes, run3000mSeconds] = latestMetrics.run3000m.split(':');
          // For 400m
          const [run400mMinutes, run400mSeconds] = latestMetrics.run400m.split(':');
          
          setTimeInputs({
            run3000m: {
              minutes: run3000mMinutes,
              seconds: run3000mSeconds
            },
            run400m: {
              minutes: run400mMinutes,
              seconds: run400mSeconds
            }
          });
        } else {
          console.log("No metrics found to pre-fill the form");
        }
      } catch (error) {
        console.error("Error loading metrics:", error);
        setError("אירעה שגיאה בטעינת המדדים");
      } finally {
        setIsLoading(false);
        console.log("Completed loading user metrics");
      }
    };
    
    loadUserMetrics();
  }, [user, isCheckingProfile]);

  // Handle time inputs updates
  useEffect(() => {
    if (metrics.run3000m) {
      setTimeInputs(prev => ({
        ...prev,
        run3000m: parseTimeToInputs(metrics.run3000m)
      }));
    }
    
    if (metrics.run400m) {
      setTimeInputs(prev => ({
        ...prev,
        run400m: parseTimeToInputs(metrics.run400m)
      }));
    }
  }, [metrics.run3000m, metrics.run400m]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const loadingToast = toast.loading('שומר מדדים...') as string;

      // Format time inputs into metrics format
      const formattedMetrics = {
        ...metrics,
        run3000m: `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`,
        run400m: `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`,
      };

      // Only proceed with the save if all fields are filled properly
      // This validation only runs when clicking the save button on step 3
      
      // Check run times
      if (formattedMetrics.run3000m === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר', { id: loadingToast });
        return;
      }
      
      if (formattedMetrics.run400m === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 400 מטר', { id: loadingToast });
        return;
      }
      
      // Check strength fields
      if (!formattedMetrics.pullUps) {
        toast.error('יש להזין את מספר המתחים', { id: loadingToast });
        return;
      }
      
      if (!formattedMetrics.pushUps) {
        toast.error('יש להזין את מספר השכיבות שמיכה', { id: loadingToast });
        return;
      }
      
      if (!formattedMetrics.sitUps2min) {
        toast.error('יש להזין את מספר הבטן', { id: loadingToast });
        return;
      }

      // Add timestamp and user ID to metrics
      const metricsData = {
        ...formattedMetrics,
        userId: user?.uid || '',
        createdAt: new Date().toISOString(),
      };

      console.log("Saving metrics data:", metricsData);
      
      // Save to Firebase
      const savedMetric = await addDocument('metrics', metricsData);
      console.log("Successfully saved metric with ID:", savedMetric.id);
      
      // Create a complete metrics object
      const completeMetric: Metrics = {
        ...metricsData,
        id: savedMetric.id,
        userId: user?.uid || '' // Ensure userId is not undefined
      };
      
      // Update local state
      setPreviousMetrics(prev => [completeMetric, ...prev]);
      
      // Reset form
      setMetrics({
        run3000m: "",
        pullUps: "",
        pushUps: "",
        run400m: "",
        sitUps2min: "",
      });
      setTimeInputs({
        run3000m: { minutes: "", seconds: "" },
        run400m: { minutes: "", seconds: "" }
      });
      setCurrentStep(1);
      setShowForm(false);

      toast.success('המדדים נשמרו בהצלחה!', { id: loadingToast });
      
      // Fetch the latest metrics again to ensure we have the latest data
      console.log("Re-fetching metrics after save...");
      try {
        // Use a simpler query that doesn't require a composite index
        const metricsRef = collection(db, "metrics");
        const q = query(
          metricsRef,
          where("userId", "==", user?.uid || '')
        );
        
        const querySnapshot = await getDocs(q);
        const refreshedMetricsData: Metrics[] = [];
        
        querySnapshot.forEach((doc) => {
          refreshedMetricsData.push({
            id: doc.id,
            ...doc.data()
          } as Metrics);
        });
        
        // Sort the metrics by createdAt on the client-side
        refreshedMetricsData.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        console.log("Fetched updated metrics:", refreshedMetricsData.length);
        setPreviousMetrics(refreshedMetricsData);
      } catch (error) {
        console.error("Error fetching updated metrics:", error);
      }
      
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('אירעה שגיאה בשמירת המדדים');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pullUps' || name === 'pushUps' || name === 'sitUps2min') {
      const numValue = value === '' ? '' : Math.max(0, parseInt(value)).toString();
      setMetrics(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setMetrics(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTimeChange = (metricName: 'run3000m' | 'run400m', field: 'minutes' | 'seconds', value: string) => {
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
  };

  const parseTimeToInputs = (timeString: string) => {
    if (!timeString || !timeString.includes(':')) return { minutes: '', seconds: '' };
    
    const [minutes, seconds] = timeString.split(':');
    return { minutes, seconds };
  };

  const nextStep = () => {
    // To prevent validation issues, explicitly handle just the step change
    if (currentStep === 1) {
      // Only validate the 3000m field
      const run3000Time = `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`;
      if (run3000Time === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר');
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    if (currentStep === 2) {
      // Only validate the 400m field
      const run400Time = `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`;
      if (run400Time === "0:00") {
        toast.error('יש להזין זמן תקין עבור ריצת 400 מטר');
        return;
      }
      setCurrentStep(3);
      return;
    }
  };
  
  // A direct step selector that doesn't validate
  const selectStep = (step: number) => {
    setCurrentStep(step);
  };
  
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
      await deleteDocument('metrics', metricId);
      setPreviousMetrics(prev => prev.filter(metric => metric.id !== metricId));
      toast.success('המדד נמחק בהצלחה!', { id: loadingToast });
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast.error('אירעה שגיאה במחיקת המדד');
    }
  };

  if (!user || isCheckingProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex flex-col gap-4">
          {/* Tab Navigation - Enhanced with pill style */}
          <div className="flex justify-center mb-8 mt-4">
            <div className="bg-gray-100 p-1.5 rounded-full inline-flex shadow-md">
              <button 
                className={`px-6 py-2.5 rounded-full font-medium text-base flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'personal' 
                    ? 'bg-white text-[#ff8714] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                <FaChartBar className="text-lg" />
                המדדים שלי
              </button>
              <button 
                className={`px-6 py-2.5 rounded-full font-medium text-base flex items-center gap-2 transition-all duration-200 ${
                  activeTab === 'social' 
                    ? 'bg-white text-[#ff8714] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('social')}
              >
                <FaUsers className="w-4 h-4" />
                <span>השוואה חברתית</span>
              </button>
            </div>
          </div>

          {activeTab === 'personal' ? (
            <div className="animate-fadeIn">
              {/* Personal Metrics Tab Content */}
              {/* Add New Metrics Button - Floating action button style */}
              <div className="fixed bottom-6 right-6 z-10">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#ff8714] text-white shadow-lg hover:bg-[#e67200] transition-all duration-200 ${
                    showForm ? 'rotate-45' : ''
                  }`}
                  aria-label={showForm ? "Close form" : "Add new metrics"}
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </div>
            
              {/* Metrics Form - Showing with animation */}
              {showForm && (
                <div className="bg-white rounded-xl p-6 mb-8 shadow-xl border border-gray-200 animate-slideUp">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">הזנת מדדים חדשים</h2>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                      {[1, 2, 3].map(step => (
                        <div
                          key={step}
                          className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all ${
                            currentStep === step 
                              ? 'bg-[#ff8714] text-white' 
                              : 'text-gray-500 hover:bg-gray-200'
                          }`}
                          onClick={() => selectStep(step)}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1 - Aerobic */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff8714]/10 mb-2">
                            <FaRunning className="text-[#ff8714] w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-medium">סיבולת אירובית</h3>
                          <p className="text-gray-500 text-sm">הזן את זמן ריצת 3,000 מטר שלך</p>
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
                          <p className="text-xs text-gray-500 text-center mt-2">הזן את הזמן בפורמט דקות:שניות (לדוגמה: 12:30)</p>
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
                          <p className="text-gray-500 text-sm">הזן את זמן ריצת 400 מטר שלך</p>
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
                          <p className="text-xs text-gray-500 text-center mt-2">הזן את הזמן בפורמט דקות:שניות (לדוגמה: 1:20)</p>
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
                          <p className="text-gray-500 text-sm">הזן את תוצאות תרגילי הכוח שלך</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">מתח (חזרות)</label>
                            <div className="relative">
                              <input
                                type="number"
                                name="pullUps"
                                value={metrics.pullUps}
                                onChange={handleChange}
                                placeholder="למשל: 10"
                                min="0"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    pullUps: prev.pullUps ? (parseInt(prev.pullUps) + 1).toString() : "1"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-l border-gray-300 rounded-r-lg hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                              <div className="absolute inset-y-0 left-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    pullUps: prev.pullUps && parseInt(prev.pullUps) > 0 ? (parseInt(prev.pullUps) - 1).toString() : "0"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-r border-gray-300 rounded-l-lg hover:bg-gray-200"
                                  disabled={!metrics.pullUps || parseInt(metrics.pullUps) <= 0}
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">שכיבות שמיכה (חזרות)</label>
                            <div className="relative">
                              <input
                                type="number"
                                name="pushUps"
                                value={metrics.pushUps}
                                onChange={handleChange}
                                placeholder="למשל: 20"
                                min="0"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    pushUps: prev.pushUps ? (parseInt(prev.pushUps) + 1).toString() : "1"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-l border-gray-300 rounded-r-lg hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                              <div className="absolute inset-y-0 left-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    pushUps: prev.pushUps && parseInt(prev.pushUps) > 0 ? (parseInt(prev.pushUps) - 1).toString() : "0"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-r border-gray-300 rounded-l-lg hover:bg-gray-200"
                                  disabled={!metrics.pushUps || parseInt(metrics.pushUps) <= 0}
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">בטן (חזרות ב-2 דקות)</label>
                            <div className="relative">
                              <input
                                type="number"
                                name="sitUps2min"
                                value={metrics.sitUps2min}
                                onChange={handleChange}
                                placeholder="למשל: 40"
                                min="0"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8714] text-center text-lg"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    sitUps2min: prev.sitUps2min ? (parseInt(prev.sitUps2min) + 1).toString() : "1"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-l border-gray-300 rounded-r-lg hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                              <div className="absolute inset-y-0 left-0 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setMetrics(prev => ({
                                    ...prev,
                                    sitUps2min: prev.sitUps2min && parseInt(prev.sitUps2min) > 0 ? (parseInt(prev.sitUps2min) - 1).toString() : "0"
                                  }))}
                                  className="h-full px-3 bg-gray-100 border-r border-gray-300 rounded-l-lg hover:bg-gray-200"
                                  disabled={!metrics.sitUps2min || parseInt(metrics.sitUps2min) <= 0}
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation Buttons - Enhanced with progress indicator */}
                    <div className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-24">
                          {currentStep > 1 && (
                            <button
                              type="button"
                              onClick={prevStep}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                            >
                              <span>הקודם</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {[1, 2, 3].map(step => (
                            <div 
                              key={step}
                              className={`w-2 h-2 rounded-full ${
                                currentStep === step ? 'bg-[#ff8714]' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <div className="w-24 text-right">
                          {currentStep < 3 ? (
                            <button
                              type="button"
                              onClick={nextStep}
                              className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
                            >
                              <span>הבא</span>
                            </button>
                          ) : (
                            <button
                              type="submit"
                              className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
                            >
                              <span>שמור</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
                
              {/* Previous Metrics - Enhanced with better cards */}
              {previousMetrics.length > 0 ? (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#ff8714] rounded-full"></span>
                    המדדים שלי
                  </h2>
                  
                  {/* Latest Metrics Card - Featured */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#ff8714]/10 flex items-center justify-center">
                          <FaRunning className="text-[#ff8714] w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">המדדים האחרונים שלי</h3>
                          <div className="text-sm text-gray-500">{formatDate(previousMetrics[0].createdAt)}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(previousMetrics[0].id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        aria-label="Delete metric"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">ריצת 3,000 מטר</div>
                        <div className="font-bold text-lg">{previousMetrics[0].run3000m}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">ריצת 400 מטר</div>
                        <div className="font-bold text-lg">{previousMetrics[0].run400m}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">מתח</div>
                        <div className="font-bold text-lg">{previousMetrics[0].pullUps}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">שכיבות שמיכה</div>
                        <div className="font-bold text-lg">{previousMetrics[0].pushUps}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">בטן 2 דקות</div>
                        <div className="font-bold text-lg">{previousMetrics[0].sitUps2min}</div>
                      </div>
                    </div>
                    
                    {userTeamType === 'נוער' && (
                      <MetricsFifaCard metrics={previousMetrics[0]} />
                    )}
                  </div>
                  
                  {/* Previous Metrics History */}
                  {previousMetrics.length > 1 && (
                    <>
                      <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                        <span className="w-1 h-5 bg-gray-300 rounded-full"></span>
                        היסטוריית מדדים
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previousMetrics.slice(1).map((metric) => (
                          <div key={metric.id} className="bg-white rounded-xl p-4 shadow border border-gray-200 relative hover:shadow-md transition-shadow group">
                            <button 
                              onClick={() => handleDelete(metric.id)}
                              className="absolute top-3 left-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Delete metric"
                            >
                              <FaTrash />
                            </button>
                            
                            <div className="text-sm text-gray-500 mb-3">{formatDate(metric.createdAt)}</div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <FaRunning className="text-[#ff8714] w-4 h-4 flex-shrink-0" />
                                <div>
                                  <div className="text-xs text-gray-500">ריצת 3,000 מטר</div>
                                  <div className="font-medium">{metric.run3000m}</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <FaStopwatch className="text-[#ff8714] w-4 h-4 flex-shrink-0" />
                                <div>
                                  <div className="text-xs text-gray-500">ריצת 400 מטר</div>
                                  <div className="font-medium">{metric.run400m}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center bg-gray-50 rounded p-1">
                                <div className="text-xs text-gray-500">מתח</div>
                                <div className="font-medium">{metric.pullUps}</div>
                              </div>
                              
                              <div className="text-center bg-gray-50 rounded p-1">
                                <div className="text-xs text-gray-500">שכיבות</div>
                                <div className="font-medium">{metric.pushUps}</div>
                              </div>
                              
                              <div className="text-center bg-gray-50 rounded p-1">
                                <div className="text-xs text-gray-500">בטן</div>
                                <div className="font-medium">{metric.sitUps2min}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff8714]/10 mb-4">
                    <FaRunning className="text-[#ff8714] w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">אין לך עדיין מדדים</h3>
                  <p className="text-gray-500 mb-6">הוסף מדדים חדשים כדי לראות את הנתונים שלך</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-[#ff8714] text-white rounded-full font-medium hover:bg-[#e67200] transition-colors inline-flex items-center gap-2"
                  >
                    <FaPlus /> הזן מדדים חדשים
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* Social Comparison Tab Content */}
              {userTeamType === 'נוער' ? (
                previousMetrics && previousMetrics.length > 0 ? (
                  <MetricsComparison 
                    userMetrics={previousMetrics[0]} 
                    userName={userName}
                    userPhoto={userPhoto}
                    userGroup={userGroup}
                    userGender={userGender}
                  />
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff8714]/10 mb-4">
                      <FaUsers className="text-[#ff8714] w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">אין לך עדיין מדדים להשוואה</h3>
                    <p className="text-gray-500 mb-6">הוסף מדדים חדשים כדי להשוות את עצמך לאחרים</p>
                    <button
                      onClick={() => {
                        setActiveTab('personal');
                        setShowForm(true);
                      }}
                      className="px-6 py-3 bg-[#ff8714] text-white rounded-full font-medium hover:bg-[#e67200] transition-colors inline-flex items-center gap-2"
                    >
                      <FaPlus /> הזן מדדים חדשים
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff8714]/10 mb-4">
                    <FaUsers className="text-[#ff8714] w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">השוואה חברתית זמינה רק לקבוצות נוער</h3>
                  <p className="text-gray-500 mb-6">אתה יכול להמשיך להזין מדדים ולראות את ההיסטוריה שלך</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
} 