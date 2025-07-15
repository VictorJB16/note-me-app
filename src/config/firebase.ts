// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBuSe6p6Tz2JNVBwQ8aM7mG5KpJwU3sW1Q",
  authDomain: "note-me-ca102.firebaseapp.com",
  projectId: "note-me-ca102",
  storageBucket: "note-me-ca102.firebasestorage.app",
  messagingSenderId: "989801999231",
  appId: "1:989801999231:web:1d1fad387cde29bae9084a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
