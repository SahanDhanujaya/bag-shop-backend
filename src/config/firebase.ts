import admin from 'firebase-admin';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';
import serviceAccount from './bag-shop-b3d85-firebase-adminsdk-fbsvc-b2dbc1b97b.json' with { type: 'json' };

// 1. Your Web App's Firebase Configuration (Client SDK)
const firebaseConfig = {
  apiKey: "AIzaSyAEKqN22fpOeb_rRjdkF0BN_aaYuz8pmlw",
  authDomain: "bag-shop-b3d85.firebaseapp.com",
  projectId: "bag-shop-b3d85",
  storageBucket: "bag-shop-b3d85.firebasestorage.app",
  messagingSenderId: "1025034474986",
  appId: "1:1025034474986:web:3dda4bd7d7321e5bcd8e93",
  measurementId: "G-M386FZMPRW"
};

// 2. Initialize Firebase Admin SDK (Server-side)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
  console.log("✅ Firebase Admin Initialized");
}

// 3. Initialize Firebase Client SDK (For signInWithEmailAndPassword)
const clientApp = initializeClientApp(firebaseConfig);

// 4. Export Auth instances
export const adminAuth = admin.auth();          // Use for middleware and registration
export const clientAuth = getClientAuth(clientApp); // Use for login function