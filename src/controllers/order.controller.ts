import type { Request, Response } from "express";
import { Order } from "../models/order.ts";
import mongoose from "mongoose";

// --- CREATE ORDER ---
export const createOrder = async (req: Request, res: Response) => {
    const { name, email, address, total, cartItems } = req.body;
    
    // We get the UID from the decoded Firebase token attached by your middleware
    // const userId = (req as any).user.uid;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const newOrder = await Order.create([{
            // userId,
            name,
            email,
            address,
            total,
            cartItems
        }], { session });

        await session.commitTransaction();
        res.status(201).json(newOrder[0]);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: "Failed to place order" });
    } finally {
        session.endSession();
    }
};

// --- GET USER ORDERS (For the Customer) ---
export const getMyOrders = async (req: Request, res: Response) => {
    try {
        /** * Your authMiddleware should attach user data to the request object.
         * We use the email from the authenticated user to find their specific orders.
         */
        const userEmail = (req as any).user?.email; 

        if (!userEmail) {
            return res.status(401).json({ error: "Unauthorized: No user email found in token" });
        }

        // Find orders matching the email and sort by newest first
        const orders = await Order.find({ email: userEmail }).sort({ createdAt: -1 }); 

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch your orders" }); 
    }
};

// --- GET ALL ORDERS (For Admin Dashboard) ---
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all orders" });
    }
};

// --- UPDATE ORDER STATUS (Admin only) ---
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: "Failed to update status" });
    }
};