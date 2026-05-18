import { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user: {
        uid: string;
        email?: string;
        role: 'admin' | 'customer';
      };
    }
  }
}