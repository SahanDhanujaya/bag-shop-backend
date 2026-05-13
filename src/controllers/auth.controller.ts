import type { Request, Response } from 'express';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminAuth, clientAuth } from '../config/firebase.ts'; 

export const register = async (req: Request, res: Response) => {
    const { email, password, displayName, role } = req.body; // role should be 'admin' or 'customer'
    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        if (!userRecord) {
            return res.status(400).json({ error: 'User registration failed' });
        }

        // --- ADDED: Set Custom Claims ---
        if (role) {
            await adminAuth.setCustomUserClaims(userRecord.uid, { role });
        } else {
            // Default to customer if no role is provided
            await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'customer' });
        }

        res.status(201).json({ 
            message: 'User registered successfully', 
            uid: userRecord.uid 
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        // Use clientAuth for password sign-in
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;

        // Access the token manager for accessToken and refreshToken
        const stsTokenManager = (user as any).stsTokenManager;

        res.status(200).json({
            message: 'Login successful',
            uid: user.uid,
            accessToken: stsTokenManager.accessToken,
            refreshToken: stsTokenManager.refreshToken,
            expiresIn: stsTokenManager.expirationTime
        });
    } catch (error: any) {
        console.error('Login error:', error.code);
        res.status(401).json({ error: 'Invalid email or password' });
    }
};