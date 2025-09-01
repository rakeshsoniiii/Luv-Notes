import React from "react";
import { Toaster } from "react-hot-toast";

// Simple test component to see if React is working
const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔥 Firebase Debug Test</h1>
      <p>If you can see this, React is working!</p>
      
      <div style={{ background: '#f0f0f0', padding: '15px', margin: '10px 0' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Check browser console for errors (F12)</li>
          <li>Make sure Firebase config is correct</li>
          <li>Verify internet connection</li>
        </ol>
      </div>
      
      <button 
        onClick={() => alert('Button works!')}
        style={{ 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
      
      <Toaster />
    </div>
  );
};

export default TestApp;