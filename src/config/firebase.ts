import admin from 'firebase-admin';
import serviceAccount from './bag-shop-b3d85-firebase-adminsdk-fbsvc-b2dbc1b97b.json' with { type: 'json' };

// Use getApps() and initializeApp from the core admin object
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
  console.log("✅ Firebase Admin Initialized");
}

export const auth = admin.auth();