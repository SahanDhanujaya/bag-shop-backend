import type { Request, Response } from "express";
import { User } from "../models/auth.ts";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found in request" });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Failed to fetch profile information" });
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: No user found in request" });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.address = req.body.address || user.address;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Failed to update profile information" });
    }
};