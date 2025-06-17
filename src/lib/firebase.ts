
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "QZ9baWvsyVyikIezxsFzfmeNf6is1zF1ijMz2BpY",
  authDomain: "poker-clock-7cd0c.firebaseapp.com",
  databaseURL: "https://poker-clock-7cd0c-default-rtdb.firebaseio.com/",
  projectId: "poker-clock-7cd0c",
  storageBucket: "poker-clock-7cd0c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Check if Firebase app is already initialized to prevent duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const database = getDatabase(app);
export const auth = getAuth(app);
