import type { Request, Response } from 'express';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { adminAuth, clientAuth } from '../config/firebase.ts'; 
import { User } from '../models/auth.ts';

export const register = async (req: Request, res: Response) => {
    const { email, password, name, role, address } = req.body; // role should be 'admin' or 'customer'
    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
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
        await User.create({ name, email, password, address });

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
        const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
        const user = userCredential.user;

        // FORCE REFRESH (true) ensures the 'role' claim is included in the token
        const idTokenResult = await user.getIdTokenResult(true);

        res.status(200).json({
            message: 'Login successful',
            uid: user.uid,
            accessToken: idTokenResult.token, // This is the valid JWT
            refreshToken: user.refreshToken,
            expiresIn: idTokenResult.expirationTime,
            role: idTokenResult.claims.role || 'customer'
        });
    } catch (error: any) {
        console.error('Login error:', error.code);
        res.status(401).json({ error: 'Invalid email or password' });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/', 
    });

    res.status(200).json({ message: 'Logged out successfully' });
};