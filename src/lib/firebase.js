import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvBppTLTDs8qALcOjSmQgZU_KoPODp1I0",
  authDomain: "admoirmaozinho.firebaseapp.com",
  projectId: "admoirmaozinho",
  storageBucket: "admoirmaozinho.firebasestorage.app",
  messagingSenderId: "79331048689",
  appId: "1:79331048689:web:02506c8ddbdd3369f97d50",
  measurementId: "G-4NF3N0878T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
