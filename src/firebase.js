import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxx",
  authDomain: "note-pad-77486.firebaseapp.com",
  projectId: "note-pad-77486",
  storageBucket: "note-pad-77486.firebasestorage.app",
  messagingSenderId: "912861838881",
  appId: "1:912861838881:web:e6699335715e80f4476d60",
  measurementId: "G-M5N7HVXL5T",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
