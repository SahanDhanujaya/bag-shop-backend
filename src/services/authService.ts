import type { Request, Response } from 'express';
import { auth } from '../config/firebase.ts'; // Import the ADMIN auth instance

export const register = async (req: Request, res: Response) => {
    const { email, password, displayName } = req.body;

    try {
        // Use the ADMIN SDK to create the user
        const userRecord = await auth.createUser({
            email,
            password,
            displayName,
        });

        res.status(201).json({ 
            message: 'User registered successfully', 
            uid: userRecord.uid 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}

export const login = async (req: Request, res: Response) => {
    // SECURITY NOTE: In a real app, the frontend handles login.
    // The backend just receives the token and verifies it via middleware.
    res.status(400).json({ 
        message: "Login should be handled on the frontend. Send the ID Token to the backend instead." 
    });
}