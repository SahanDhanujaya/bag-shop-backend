import admin from 'firebase-admin';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

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

// 2. Resolve and Load the Firebase Admin Service Account Credentials dynamically
let serviceAccount: any;

const jsonFilename = 'bag-shop-b3d85-firebase-adminsdk-fbsvc-b2dbc1b97b.json';

// Path on Render (Secret Files are placed in the app root workspace directory)
const renderRootPath = path.join(process.cwd(), jsonFilename);

// Path on Local Development Environment (Inside src/config/)
const localConfigPath = path.join(process.cwd(), 'src', 'config', jsonFilename);

if (fs.existsSync(renderRootPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(renderRootPath, 'utf8'));
  console.log("🔐 Firebase Admin credentials loaded from Render Root Workspace.");
} else if (fs.existsSync(localConfigPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(localConfigPath, 'utf8'));
  console.log("💻 Firebase Admin credentials loaded from Local Config Directory.");
} else {
  throw new Error(`❌ Critical: Firebase Service Account JSON file (${jsonFilename}) could not be found locally or on the server platform.`);
}

// 3. Initialize Firebase Admin SDK (Server-side)
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
}

// 4. Initialize Firebase Client SDK (For signInWithEmailAndPassword)
const clientApp = initializeClientApp(firebaseConfig);

// 5. Export Auth instances
export const adminAuth = admin.auth();               // Use for middleware and registration
export const clientAuth = getClientAuth(clientApp);   // Use for login function