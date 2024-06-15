// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mean-blog-297c7.firebaseapp.com",
  projectId: "mean-blog-297c7",
  storageBucket: "mean-blog-297c7.appspot.com",
  messagingSenderId: "101206385743",
  appId: "1:101206385743:web:1c3f4987e01f777af8f63a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);