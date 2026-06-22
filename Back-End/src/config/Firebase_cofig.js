
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// https://firebase.google.com/docs/web/setup#available-libraries



const firebaseConfig = {
  apiKey: "AIzaSyDLOgPXPIvibsk7o_bLlBYVRJ1L3flSwkc",
  authDomain: "ecommerce-prac-4ce11.firebaseapp.com",
  projectId: "ecommerce-prac-4ce11",
  storageBucket: "ecommerce-prac-4ce11.firebasestorage.app",
  messagingSenderId: "971366787008",
  appId: "1:971366787008:web:f0b1b451359496d9920a25",
  measurementId: "G-575E9RPQ1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);