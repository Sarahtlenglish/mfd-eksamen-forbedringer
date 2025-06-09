// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDV-lauYhta94HjC13Ilgb82JSOaclFMI4",
  authDomain: "dbi-forbedringer.firebaseapp.com",
  projectId: "dbi-forbedringer",
  storageBucket: "dbi-forbedringer.firebasestorage.app",
  messagingSenderId: "673003719786",
  appId: "1:673003719786:web:41e5d4660813c373110e13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };

