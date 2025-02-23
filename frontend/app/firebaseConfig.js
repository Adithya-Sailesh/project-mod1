import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAJr8I_zOts1DnX5-ubEjjRSLzC2tEx3N0",
    authDomain: "project1-dcfe6.firebaseapp.com",
    projectId: "project1-dcfe6",
    storageBucket: "project1-dcfe6.firebasestorage.app",
    messagingSenderId: "829974941247",
    appId: "1:829974941247:web:f1a5d2e5f173310bd5728a",
    measurementId: "G-1BN8ZD4L15"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);