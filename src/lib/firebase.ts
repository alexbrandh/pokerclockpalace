
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkJ8Q5X5X5X5X5X5X5X5X5X5X5X5X5X5X",
  authDomain: "poker-clock-7cd0c.firebaseapp.com",
  databaseURL: "https://poker-clock-7cd0c-default-rtdb.firebaseio.com/",
  projectId: "poker-clock-7cd0c",
  storageBucket: "poker-clock-7cd0c.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
