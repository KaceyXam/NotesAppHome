// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyDAgd0_v6AFEunAbz2L9YRuP896_t_LyQQ",
  authDomain: "notesapp-44b3c.firebaseapp.com",
  projectId: "notesapp-44b3c",
  storageBucket: "notesapp-44b3c.appspot.com",
  messagingSenderId: "160695960605",
  appId: "1:160695960605:web:739edbeb170c7dd615f2f4",
  measurementId: "G-G57KLLSWRS"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };