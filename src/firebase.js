import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAoouUyFMIchbbzitYtnlNPX9m8mCdFA0Q",
  authDomain: "interconether.firebaseapp.com",
  projectId: "interconether",
  storageBucket: "interconether.firebasestorage.app",
  messagingSenderId: "729018944352",
  appId: "1:729018944352:web:eddeca37416bdd7484ec05",
  measurementId: "G-RSB7CX64JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
