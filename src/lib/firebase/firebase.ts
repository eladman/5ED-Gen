"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBFhnAlCJr9CFAotAdvce-x6aIGBwgLPYI",
  authDomain: "generator-e88ff.firebaseapp.com",
  projectId: "generator-e88ff",
  storageBucket: "generator-e88ff.appspot.com",
  messagingSenderId: "434360409747",
  appId: "1:434360409747:web:996bc32b48496e2e67b766"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firebaseDb: Firestore;
let firebaseStorage: FirebaseStorage;

try {
  console.log("Attempting to initialize Firebase with config:", firebaseConfig);
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
  firebaseStorage = getStorage(firebaseApp);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error; // Re-throw to prevent the app from running with uninitialized Firebase
}

export { firebaseApp as app, firebaseAuth as auth, firebaseDb as db, firebaseStorage as storage };
