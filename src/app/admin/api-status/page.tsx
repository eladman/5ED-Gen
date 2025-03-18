'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaKey, FaSync, FaSave } from 'react-icons/fa';

export default function ApiStatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect non-admin users
    if (user === null) {
      // Still loading auth state
      return;
    }
    
    // Check if user is admin - you may need to adjust this based on your actual admin check logic
    const isAdmin = user && user.email === 'admin@example.com'; // Replace with your admin check
    
    if (!user || !isAdmin) {
      router.push('/');
    } else {
      checkApiStatus();
    }
  }, [user, router]);

  const checkApiStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/openai/verify-key');
      const data = await response.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check API status');
    } finally {
      setLoading(false);
    }
  };

  const updateApiKey = async () => {
    if (!newApiKey) {
      setUpdateError('יש להזין מפתח API');
      return;
    }

    // Basic validation
    if (!(newApiKey.startsWith('sk-') || newApiKey.startsWith('sk-proj-')) || newApiKey.length < 20) {
      setUpdateError('פורמט מפתח API לא תקין. המפתח צריך להתחיל ב-sk- או sk-proj- ולהיות באורך של לפחות 20 תווים.');
      return;
    }

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // In a real application, you would need to add proper authentication
      // This is a simplified example for development purposes
      const response = await fetch('/api/openai/update-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-secret-key' // This should be a proper auth token in production
        },
        body: JSON.stringify({ apiKey: newApiKey })
      });

      const data = await response.json();

      if (!response.ok) {
        setUpdateError(data.error || 'שגיאה בעדכון מפתח API');
      } else {
        setUpdateSuccess(true);
        setNewApiKey('');
        // Refresh the status after a short delay
        setTimeout(() => {
          checkApiStatus();
        }, 1000);
      }
    } catch (err: any) {
      setUpdateError(err.message || 'שגיאה בעדכון מפתח API');
    } finally {
      setUpdating(false);
    }
  };

  const testApiKey = async () => {
    if (!newApiKey) {
      setUpdateError('יש להזין מפתח API לבדיקה');
      return;
    }

    // Basic validation
    if (!(newApiKey.startsWith('sk-') || newApiKey.startsWith('sk-proj-')) || newApiKey.length < 20) {
      setUpdateError('פורמט מפתח API לא תקין. המפתח צריך להתחיל ב-sk- או sk-proj- ולהיות באורך של לפחות 20 תווים.');
      return;
    }

    setTesting(true);
    setUpdateError(null);
    setTestResult(null);

    try {
      const response = await fetch('/api/openai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: newApiKey })
      });

      const data = await response.json();
      setTestResult(data);

      if (!response.ok) {
        setUpdateError(data.error || 'שגיאה בבדיקת מפתח API');
      }
    } catch (err: any) {
      setUpdateError(err.message || 'שגיאה בבדיקת מפתח API');
    } finally {
      setTesting(false);
    }
  };

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">בודק סטטוס API...</h1>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff8714]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">סטטוס OpenAI API</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">שגיאה!</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-6">
          <button 
            onClick={checkApiStatus}
            className="flex items-center justify-center gap-2 w-full bg-[#ff8714] text-white py-2 px-4 rounded hover:bg-[#e67200] transition-colors"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSync className="animate-spin" />
                <span>בודק...</span>
              </>
            ) : (
              <>
                <FaSync />
                <span>בדוק שוב</span>
              </>
            )}
          </button>
        </div>
        
        {status && (
          <div className="border rounded-lg overflow-hidden">
            <div className={`p-4 flex items-center gap-3 ${
              status.status === 'valid' 
                ? 'bg-green-100 text-green-800' 
                : status.status === 'missing' || status.status === 'authentication_failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status.status === 'valid' ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : status.status === 'missing' || status.status === 'authentication_failed' ? (
                <FaTimesCircle className="text-red-500 text-xl" />
              ) : (
                <FaExclamationTriangle className="text-yellow-500 text-xl" />
              )}
              <div>
                <h2 className="font-bold text-lg">{status.message}</h2>
                <p>{status.details}</p>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FaKey />
                <span>פרטי מפתח API</span>
              </h3>
              <table className="w-full">
                <tbody>
                  {status.keyPrefix && (
                    <tr>
                      <td className="py-2 font-medium">תחילית מפתח:</td>
                      <td className="py-2">{status.keyPrefix}</td>
                    </tr>
                  )}
                  {status.keyLength && (
                    <tr>
                      <td className="py-2 font-medium">אורך מפתח:</td>
                      <td className="py-2">{status.keyLength} תווים</td>
                    </tr>
                  )}
                  {status.modelsAvailable && (
                    <tr>
                      <td className="py-2 font-medium">מודלים זמינים:</td>
                      <td className="py-2">{status.modelsAvailable}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <h3 className="font-bold mb-2">הנחיות לתיקון:</h3>
              {status.status === 'valid' ? (
                <p className="text-green-600">המפתח תקין ופעיל! אין צורך בפעולה נוספת.</p>
              ) : status.status === 'missing' ? (
                <div className="space-y-2">
                  <p>יש להגדיר את משתנה הסביבה <code className="bg-gray-200 px-1 py-0.5 rounded">OPENAI_API_KEY</code> עם מפתח API תקף של OpenAI.</p>
                  <p>הוסף את המפתח לקובץ <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code> בתיקיית הפרויקט:</p>
                  <pre className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
                    OPENAI_API_KEY=sk-your-api-key-here
                  </pre>
                  <p className="text-sm text-gray-600 mt-2">הערה: מפתחות API יכולים להתחיל ב-<code className="bg-gray-200 px-1 py-0.5 rounded">sk-</code> או <code className="bg-gray-200 px-1 py-0.5 rounded">sk-proj-</code> בהתאם לסוג החשבון שלך ב-OpenAI.</p>
                </div>
              ) : status.status === 'authentication_failed' ? (
                <div className="space-y-2">
                  <p>המפתח שסופק אינו תקף או שפג תוקפו. יש לבדוק את המפתח בלוח הבקרה של OpenAI.</p>
                  <p>ודא שהמפתח מתחיל ב-<code className="bg-gray-200 px-1 py-0.5 rounded">sk-</code> או <code className="bg-gray-200 px-1 py-0.5 rounded">sk-proj-</code> ושהוא מפתח API תקף.</p>
                  <p>אם המפתח חדש, ייתכן שיש להמתין מספר דקות עד שיופעל.</p>
                  <p className="mt-2 text-sm text-gray-600">שים לב: מפתחות מסוג <code className="bg-gray-200 px-1 py-0.5 rounded">sk-proj-</code> הם מפתחות פרויקט ויתכן שיש להם הגבלות שונות ממפתחות רגילים.</p>
                </div>
              ) : status.status === 'invalid_format' ? (
                <div className="space-y-2">
                  <p>פורמט המפתח אינו תקין. מפתחות API של OpenAI מתחילים ב-<code className="bg-gray-200 px-1 py-0.5 rounded">sk-</code> או <code className="bg-gray-200 px-1 py-0.5 rounded">sk-proj-</code> ואורכם לפחות 20 תווים.</p>
                  <p>בדוק את המפתח ב-<code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code> וודא שהוא הועתק במלואו.</p>
                </div>
              ) : (
                <p>אירעה שגיאה לא צפויה. נסה לבדוק את המפתח שוב או צור קשר עם התמיכה של OpenAI.</p>
              )}
            </div>
          </div>
        )}
        
        {/* API Key Update Form */}
        <div className="border rounded-lg overflow-hidden mt-8">
          <div className="bg-blue-50 p-4 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaKey className="text-blue-600" />
              <span>עדכון מפתח API</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">השתמש בטופס זה כדי לעדכן את מפתח ה-API של OpenAI</p>
          </div>
          
          <div className="p-4">
            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                <FaCheckCircle />
                <span>מפתח ה-API עודכן בהצלחה!</span>
              </div>
            )}
            
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">שגיאה בעדכון מפתח API:</p>
                <p>{updateError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  מפתח API חדש
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff8714] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  מפתח ה-API צריך להתחיל ב-sk- או sk-proj- ולהיות באורך של לפחות 20 תווים
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={updateApiKey}
                  disabled={updating || !newApiKey}
                  className="flex items-center justify-center gap-2 flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? (
                    <>
                      <FaSync className="animate-spin" />
                      <span>מעדכן...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>עדכן מפתח API</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={testApiKey}
                  disabled={testing || !newApiKey}
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <FaSync className="animate-spin" />
                      <span>בודק...</span>
                    </>
                  ) : (
                    <>
                      <FaKey />
                      <span>בדוק מפתח</span>
                    </>
                  )}
                </button>
              </div>
              
              {testResult && (
                <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`font-bold ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {testResult.success ? 'מפתח API תקין!' : 'מפתח API לא תקין'}
                  </h3>
                  <p className="text-sm mt-1">
                    {testResult.message || testResult.error}
                  </p>
                  {testResult.details && (
                    <p className="text-xs mt-1 text-gray-600">
                      {testResult.details}
                    </p>
                  )}
                  {testResult.models && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">מודלים זמינים:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        {testResult.models.map((model: string) => (
                          <li key={model} className="bg-white px-2 py-1 rounded">
                            {model}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 