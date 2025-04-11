'use client';

import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h1>Test Page</h1>
      <div className="mt-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setCount(count + 1)}
        >
          Count: {count}
        </button>
      </div>
      
      <div className="mt-4">
        <input 
          type="text" 
          className="border p-2 rounded"
          placeholder="Test input"
        />
      </div>
    </div>
  );
} 