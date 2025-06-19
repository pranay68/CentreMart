// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDbk4bog1pS5OzNLOhlDWQCbIkBB5QVofM",
    authDomain: "centre-mart.firebaseapp.com",
    projectId: "centre-mart",
    storageBucket: "centre-mart.appspot.com",
    messagingSenderId: "478441468038",
    appId: "1:478441468038:web:1d821edefe5279ff35a107"
};

// Initialize app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Named export (not default export)
export { db };