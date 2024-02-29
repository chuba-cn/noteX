import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {collection, getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDZD1zRjKZFr-YBwkRp_PYxdTJt4c1at4I",
  authDomain: "notex-c0b22.firebaseapp.com",
  projectId: "notex-c0b22",
  storageBucket: "notex-c0b22.appspot.com",
  messagingSenderId: "956958395054",
  appId: "1:956958395054:web:a8a655038891a47858bb3f",
  measurementId: "G-S1NZEN7EXV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const notesCollection = collection(db, "notes");