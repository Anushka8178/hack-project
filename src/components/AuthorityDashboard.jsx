// AuthorityDashboard.jsx
import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

const AuthorityDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredIssues, setFilteredIssues] = useState([]);

  useEffect(() => {
    const issuesRef = ref(database, 'issues');
    onValue(issuesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const issuesArray = Object.entries(data).map(([id, issue]) => ({ id, ...issue }));
      setIssues(issuesArray);
      setFilteredIssues(issuesArray);
    });
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredIssues(issues);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const filtered = issues.filter(issue => {
      if (!issue.location || !issue.location.coordinates) return false;
      return issue.location.coordinates.toLowerCase().includes(lowerSearch) ||
             (issue.text && issue.text.toLowerCase().includes(lowerSearch));
    });
    setFilteredIssues(filtered);
  }, [search, issues]);

  return (
    <div className="authority-dashboard">
      <h2>Authority Dashboard</h2>
      <input 
        type="text" 
        placeholder="Enter location or keywords to search issues" 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{width: '100%', padding: '8px', marginBottom: '16px'}}
      />

      {filteredIssues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul style={{listStyle: 'none', padding: 0}}>
          {filteredIssues.map(({id, text, timestamp, status, location}) => (
            <li key={id} style={{borderBottom: '1px solid #ccc', padding: '10px 0'}}>
              <p><strong>Complaint:</strong> {text}</p>
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Time:</strong> {new Date(timestamp).toLocaleString()}</p>
              {location && (
                <p><strong>Location:</strong> {location.coordinates}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorityDashboard;
