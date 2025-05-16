import Login from "./components/Login";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { auth, database } from './firebase';

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import AuthorityDashboard from "./components/AuthorityDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const roleRef = ref(database, `users/${currentUser.uid}/role`);
        const snapshot = await get(roleRef);
        if (snapshot.exists()) {
          setRole(snapshot.val());
        } else {
          setRole("user"); // fallback role
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false); // stop loading after auth check
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;


  return (
    <Router>
      <Navbar />
      <Routes>
        {role === "authority" ? (
          <Route path="/*" element={<AuthorityDashboard />} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
