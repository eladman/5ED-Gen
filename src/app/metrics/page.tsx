"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Navbar, MetricsFifaCard, MetricsComparison } from '@/components';
import type { MetricsComparisonProps } from '@/components/dashboard/MetricsComparison';
import { FaRunning, FaDumbbell, FaStopwatch, FaPlus, FaTrash, FaUsers, FaChartBar, FaPencilAlt } from "react-icons/fa";
import { GiSittingDog } from "react-icons/gi";
import toast, { Toaster } from "react-hot-toast";
import { addDocument, getDocuments, deleteDocument, updateDocument } from "@/lib/firebase/firebaseUtils";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metrics | null>(null);

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
        
        // Get user metrics using our enhanced util with localStorage fallback
        console.log("Fetching metrics for user:", user.uid);
        try {
          // Use our enhanced getDocuments with localStorage fallback
          const metricsData = await getDocuments("metrics") as Metrics[];
          
          // Filter metrics by user ID on the client side
          const userMetrics = metricsData.filter(metric => metric.userId === user.uid);
          console.log("Filtered metrics for current user:", userMetrics.length);
          
          // Sort by createdAt on the client-side
          userMetrics.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          console.log("Total metrics loaded:", userMetrics.length);
          setPreviousMetrics(userMetrics);
          
          // If there are metrics, pre-fill form with most recent values
          if (userMetrics.length > 0) {
            console.log("Pre-filling form with latest metrics");
            const latestMetrics = userMetrics[0];
            
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
    
    // Only run validation and submission if we're on the final step
    if (currentStep !== 3) {
      return;
    }
    
    let loadingToast = toast.loading(isEditing ? 'מעדכן מדדים...' : 'שומר מדדים...') as string;
    
    try {
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

      if (isEditing && editingMetric) {
        // This is an update operation
        try {
          await updateDocument('metrics', editingMetric.id, formattedMetrics);
          
          // Update the metrics in the local state
          setPreviousMetrics(prev => 
            prev.map(metric => 
              metric.id === editingMetric.id 
                ? { ...metric, ...formattedMetrics } 
                : metric
            )
          );
          
          toast.success('המדדים עודכנו בהצלחה!', { id: loadingToast });
        } catch (error) {
          console.error('Error updating metrics:', error);
          toast.error('אירעה שגיאה בעדכון המדדים', { id: loadingToast });
          return;
        }
      } else {
        // This is a new metrics creation - original code for adding new metrics
        // Add timestamp and user ID to metrics
        const metricsData = {
          ...formattedMetrics,
          userId: user?.uid || '',
          createdAt: new Date().toISOString(),
        };

        console.log("Saving metrics data:", metricsData);
        
        // Try to save to Firestore with localStorage fallback
        let savedMetric;
        try {
          // Try up to 3 times if needed
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            attempts++;
            console.log(`Saving metrics attempt ${attempts}/${maxAttempts}`);
            
            try {
              // Save metrics data
              savedMetric = await addDocument('metrics', metricsData);
              console.log("Save result:", savedMetric);
              
              // If successful, break out of retry loop
              if (savedMetric && savedMetric.id) {
                break;
              }
            } catch (saveError: any) {
              console.error(`Metrics save attempt ${attempts} failed:`, saveError);
              
              // Only throw on the last attempt
              if (attempts >= maxAttempts) {
                throw saveError;
              }
              
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (saveError: any) {
          console.error("All save attempts failed:", saveError);
          
          // Show a more specific error based on error type
          let errorMessage = 'אירעה שגיאה בשמירת המדדים';
          
          if (saveError.message && saveError.message.includes('permission-denied')) {
            errorMessage = 'אין הרשאה לשמור את המדדים. הנתונים נשמרו מקומית.';
            toast.error(errorMessage, { id: loadingToast });
            
            // Try to save locally as a last resort
            savedMetric = {
              id: `local_fallback_${Date.now()}`,
              ...metricsData,
              savedToFirestore: false
            };
          } else {
            // For other errors, show the error and exit
            toast.error(errorMessage, { id: loadingToast });
            return;
          }
        }
        
        // Check if we actually have a saved metric
        if (!savedMetric || !savedMetric.id) {
          console.error("Failed to save metric (no ID returned)");
          toast.error('אירעה שגיאה בשמירת המדדים', { id: loadingToast });
          return;
        }
        
        // Show appropriate success message based on where it was saved
        if (savedMetric.savedToFirestore) {
          toast.success('המדדים נשמרו בהצלחה!', { id: loadingToast });
        } else {
          toast.success('המדדים נשמרו בהצלחה (נשמר מקומית)', { id: loadingToast });
        }
        
        // Create a complete metrics object
        const completeMetric: Metrics = {
          ...metricsData,
          id: savedMetric.id,
          userId: user?.uid || '' // Ensure userId is not undefined
        };
        
        // Update local state immediately
        setPreviousMetrics(prev => [completeMetric, ...prev]);
      }
      
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
      setIsEditing(false);
      setEditingMetric(null);
      
      // Fetch latest metrics to update state
      try {
        // Use enhanced getDocuments with localStorage fallback
        const metricsData = await getDocuments("metrics") as Metrics[];
        
        // Filter metrics by user ID 
        const userMetrics = metricsData.filter(metric => metric.userId === user?.uid);
        
        // Sort by createdAt
        userMetrics.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        console.log("Fetched updated metrics:", userMetrics.length);
        setPreviousMetrics(userMetrics);
      } catch (error) {
        console.error("Error fetching updated metrics:", error);
        // Non-fatal error, don't show toast as the save was successful
      }
      
    } catch (error: any) {
      console.error('Error in metrics submission:', error);
      
      // More descriptive error message
      let errorMessage = 'אירעה שגיאה בשמירת המדדים';
      
      if (error.message && error.message.includes('permission')) {
        errorMessage = 'אין הרשאה לשמור את המדדים. אנא התחבר מחדש.';
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'בעיית תקשורת. אנא בדוק את החיבור לאינטרנט שלך ונסה שוב.';
      }
      
      toast.error(errorMessage, { id: loadingToast });
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
    // Add validation for going forward in steps
    if (step > currentStep) {
      // Going from step 1 to later steps - validate 3000m first
      if (currentStep === 1) {
        const run3000Time = `${timeInputs.run3000m.minutes || "0"}:${timeInputs.run3000m.seconds.padStart(2, '0')}`;
        if (run3000Time === "0:00") {
          toast.error('יש להזין זמן תקין עבור ריצת 3,000 מטר');
          return;
        }
      }
      
      // Going from step 2 to step 3 - validate 400m first
      if (currentStep === 2 && step > 2) {
        const run400Time = `${timeInputs.run400m.minutes || "0"}:${timeInputs.run400m.seconds.padStart(2, '0')}`;
        if (run400Time === "0:00") {
          toast.error('יש להזין זמן תקין עבור ריצת 400 מטר');
          return;
        }
      }
    }
    
    // If validation passed or going backwards, update the step
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
    if (confirm('האם אתה בטוח שברצונך למחוק את המדדים?')) {
      try {
        const loadingToast = toast.loading('מוחק מדדים...') as string;
        
        // Delete from Firebase/localStorage with enhanced utility
        await deleteDocument('metrics', metricId);
        
        // Update local state
        setPreviousMetrics(prev => prev.filter(metric => metric.id !== metricId));
        
        toast.success('המדדים נמחקו בהצלחה!', { id: loadingToast });
      } catch (error) {
        console.error('Error deleting metrics:', error);
        toast.error('אירעה שגיאה במחיקת המדדים');
      }
    }
  };

  const handleEdit = (metric: Metrics) => {
    // Pre-fill the form with the metric values
    setMetrics({
      run3000m: metric.run3000m,
      pullUps: metric.pullUps,
      pushUps: metric.pushUps,
      run400m: metric.run400m,
      sitUps2min: metric.sitUps2min,
    });

    // Parse time inputs
    const [run3000mMinutes, run3000mSeconds] = metric.run3000m.split(':');
    const [run400mMinutes, run400mSeconds] = metric.run400m.split(':');
    
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

    // Set editing state
    setIsEditing(true);
    setEditingMetric(metric);
    setShowForm(true);
    setCurrentStep(1);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Basic validation for time format MM:SS or numbers
    if ((name === 'run3000m' || name === 'run400m') && !/^(\d{1,2}:)?\d{1,2}$/.test(value) && value !== '') {
      toast.error("זמן ריצה צריך להיות בפורמט MM:SS או מספר שניות");
      return;
    }
    if ((name === 'pullUps' || name === 'pushUps' || name === 'sitUps2min') && !/^\d*$/.test(value)) {
      toast.error("מספר חזרות חייב להיות מספר שלם");
      return;
    }
    setMetrics(prev => ({ ...prev, [name]: value }));
  }, []);

  if (!user || isCheckingProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar isLoading={isLoading} />
      <Toaster position="bottom-center" />
      
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
              {/* Add New Metrics Button - Only show if no metrics exist */}
              {previousMetrics.length === 0 && (
                <div className="fixed bottom-6 right-6 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingMetric(null);
                      setShowForm(!showForm);
                    }}
                    className={`flex items-center justify-center w-14 h-14 rounded-full bg-[#ff8714] text-white shadow-lg hover:bg-[#e67200] transition-all duration-200 ${
                      showForm ? 'rotate-45' : ''
                    }`}
                    aria-label={showForm ? "Close form" : "Add new metrics"}
                  >
                    <FaPlus className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Edit button when user has metrics but form is not open */}
              {previousMetrics.length > 0 && !showForm && (
                <div className="fixed bottom-6 right-6 z-10">
                  <button
                    onClick={() => handleEdit(previousMetrics[0])}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-[#ff8714] text-white shadow-lg hover:bg-[#e67200] transition-all duration-200"
                    aria-label="Edit metrics"
                  >
                    <FaPencilAlt className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Close button when editing metrics */}
              {showForm && (
                <div className="fixed bottom-6 right-6 z-10">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setEditingMetric(null);
                    }}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-400 text-white shadow-lg hover:bg-gray-500 transition-all duration-200 rotate-45"
                    aria-label="Close form"
                  >
                    <FaPlus className="w-5 h-5" />
                  </button>
                </div>
              )}
            
              {/* Metrics Form - Showing with animation */}
              {showForm && (
                <div className="bg-white rounded-xl p-6 mb-8 shadow-xl border border-gray-200 animate-slideUp">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{isEditing ? 'עריכת מדדים' : 'הזנת מדדים חדשים'}</h2>
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
                            e.preventDefault(); // Prevent form submission
                            selectStep(step);
                          }}
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
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowForm(false);
                              setIsEditing(false);
                              setEditingMetric(null);
                              setCurrentStep(1);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                          >
                            <span>ביטול</span>
                          </button>
                        )}
                      </div>
                      <div className="w-24 text-right">
                        {currentStep < 3 ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent form submission
                              nextStep();
                            }}
                            className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
                          >
                            <span>הבא</span>
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#ff8714] text-white rounded-lg hover:bg-[#e67200] transition-colors flex items-center gap-1 ml-auto"
                          >
                            <span>{isEditing ? 'עדכן' : 'שמור'}</span>
                          </button>
                        )}
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
                    מדדים מאי 2025
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
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(previousMetrics[0])}
                          className="text-gray-400 hover:text-[#ff8714] transition-colors p-2"
                          aria-label="Edit metric"
                        >
                          <FaPencilAlt />
                        </button>
                        <button 
                          onClick={() => handleDelete(previousMetrics[0].id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          aria-label="Delete metric"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    {userTeamType === 'נוער' && (
                      <MetricsFifaCard metrics={previousMetrics[0]} />
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
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
                            <div className="absolute top-3 left-3 flex items-center">
                              <button 
                                onClick={() => handleEdit(metric)}
                                className="text-gray-400 hover:text-[#ff8714] opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1"
                                aria-label="Edit metric"
                              >
                                <FaPencilAlt />
                              </button>
                              <button 
                                onClick={() => handleDelete(metric.id)}
                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                aria-label="Delete metric"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            
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
                    onClick={() => {
                      setIsEditing(false);
                      setEditingMetric(null);
                      setShowForm(true);
                    }}
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
                        setIsEditing(false);
                        setEditingMetric(null);
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