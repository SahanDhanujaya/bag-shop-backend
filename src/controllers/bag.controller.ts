import type { Request, Response } from "express";
import { Bag } from "../models/bag.ts";
import mongoose from "mongoose";

// --- CREATE (With 1-5 Images) ---
export const saveBag = async (req: Request, res: Response) => {
    const { name, price, description, category, quantity } = req.body;
    const files = req.files as Express.Multer.File[]; // Access multiple files

    if (!files || files.length === 0) {
        return res.status(400).json({ error: "At least one image is required" });
    }
    if (files.length > 5) {
        return res.status(400).json({ error: "Maximum 5 images allowed" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Create an array of image paths
        const imageUrls = files.map(file => `/uploads/${file.filename}`);

        const newBag = await Bag.create([{
            name,
            price: Number(price),
            image: imageUrls, // Store as array
            description,
            category,
            quantity: Number(quantity),
        }], { session });

        await session.commitTransaction();
        return res.status(201).json(newBag[0]);
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ error: "Failed to save bag" });
    } finally {
        session.endSession();
    }
};

// --- UPDATE (With Image Support) ---
export const updateBag = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const files = req.files as Express.Multer.File[];

    try {
        // If new images are uploaded, replace the old ones
        if (files && files.length > 0) {
            if (files.length > 5) {
                return res.status(400).json({ error: "Maximum 5 images allowed" });
            }
            updates.image = files.map(file => `/uploads/${file.filename}`);
        }

        const updatedBag = await Bag.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedBag) return res.status(404).json({ error: "Bag not found" });
        
        res.status(200).json(updatedBag);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
};

// --- READ (All & Single) ---
export const getBags = async (req: Request, res: Response) => {
    try {
        const bags = await Bag.find();
        res.status(200).json(bags);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bags" });
    }
};

export const getBagById = async (req: Request, res: Response) => {
    try {
        const bag = await Bag.findById(req.params.id);
        if (!bag) return res.status(404).json({ error: "Bag not found" });
        res.status(200).json(bag);
    } catch (error) {
        res.status(500).json({ error: "Invalid ID format" });
    }
};

// --- DELETE ---
export const deleteBag = async (req: Request, res: Response) => {
    try {
        const deletedBag = await Bag.findByIdAndDelete(req.params.id);
        if (!deletedBag) return res.status(404).json({ error: "Bag not found" });
        res.status(200).json({ message: "Bag deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Delete failed" });
    }
};