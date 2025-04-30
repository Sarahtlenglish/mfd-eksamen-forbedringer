// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwJ814_t4KfCnRUz0WMdOB31oDa9cEILg",
    authDomain: "dbi-egenkontrol-mfd-958b1.firebaseapp.com",
    projectId: "dbi-egenkontrol-mfd-958b1",
    storageBucket: "dbi-egenkontrol-mfd-958b1.firebasestorage.app",
    messagingSenderId: "295302196335",
    appId: "1:295302196335:web:7339ca031904b14417b19a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };