import React from 'react';
import { useNotesContext } from '../../contexts/FirebaseNotesContext';

const ContextDebug = () => {
  const context = useNotesContext();
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Context Debug</h4>
      <div>Notes: {context?.notes?.length || 0}</div>
      <div>Archived: {context?.archivedNotes?.length || 0}</div>
      <div>Hidden: {context?.hiddenNotes?.length || 0}</div>
      <div>Loading: {context?.loading ? 'true' : 'false'}</div>
      <div>Context Keys: {Object.keys(context || {}).join(', ')}</div>
    </div>
  );
};

export default ContextDebug;