import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const FirebaseTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState('Ready to test');

  const testSignup = async () => {
    try {
      setStatus('Testing signup...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setStatus(`✅ Signup successful! User: ${result.user.email}`);
    } catch (error) {
      setStatus(`❌ Signup failed: ${error.message}`);
      console.error('Signup error:', error);
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Testing login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      setStatus(`✅ Login successful! User: ${result.user.email}`);
    } catch (error) {
      setStatus(`❌ Login failed: ${error.message}`);
      console.error('Login error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>🔥 Firebase Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <p><strong>Status:</strong> {status}</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', margin: '5px 0' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '8px', margin: '5px 0' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={testSignup}
          style={{ 
            padding: '10px 20px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Signup
        </button>
        
        <button 
          onClick={testLogin}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Login
        </button>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>First click "Test Signup" to create a test account</li>
          <li>Then click "Test Login" to test login</li>
          <li>Check the status message above</li>
        </ol>
      </div>
    </div>
  );
};

export default FirebaseTest;