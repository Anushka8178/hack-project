import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsO5A_FsIoLZUmGmhLnnLtH1EzYm_BkJA",
  authDomain: "hackathon-e39c5.firebaseapp.com",
  projectId: "hackathon-e39c5",
  storageBucket: "hackathon-e39c5.firebasestorage.app",
  messagingSenderId: "115966818170",
  appId: "1:115966818170:web:e3feea70fa62647404c8c3",
  databaseURL: "https://hackathon-e39c5-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { database, firestore, auth };
