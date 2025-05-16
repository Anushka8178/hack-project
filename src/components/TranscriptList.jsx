// TranscriptList.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import './TranscriptList.css';

const TranscriptList = () => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(firestore, 'issues'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.()?.toLocaleString() || '',
        }));
        setTranscripts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching transcripts:', err);
        setError('Failed to load transcripts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="transcript-list-container">
        <div className="loading-spinner">Loading transcripts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transcript-list-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="transcript-list-container">
      <h2>Recent Complaints</h2>
      {transcripts.length === 0 ? (
        <p className="no-transcripts">No complaints recorded yet.</p>
      ) : (
        <div className="transcript-list">
          {transcripts.map((transcript) => (
            <div key={transcript.id} className="transcript-card">
              <div className="transcript-header">
                <span className="timestamp">{transcript.timestamp}</span>
                <span className={`status ${transcript.status}`}>{transcript.status}</span>
              </div>
              <p className="transcript-text">{transcript.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptList;
