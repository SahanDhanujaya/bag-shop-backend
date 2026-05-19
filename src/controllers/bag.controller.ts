import type { Request, Response } from "express";
import { Bag } from "../models/bag.ts";
import mongoose from "mongoose";

// ─── Helper: build a full public URL for an uploaded file ────────────────────
// Produces: "http://localhost:5000/uploads/1718000000000-bag.jpg"
const toFullUrl = (req: Request, filename: string): string =>
  `${req.protocol}://${req.get("host")}/uploads/${filename}`;

// ─── CREATE  POST /api/bags ───────────────────────────────────────────────────
// Multer field: upload.array("images", 5)
export const saveBag = async (req: Request, res: Response) => {
  const { name, price, description, category, quantity } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }
  if (files.length > 5) {
    return res.status(400).json({ error: "Maximum 5 images allowed" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Store FULL URLs so the frontend can render them with no extra prefix
    const imageUrls = files.map((file) => toFullUrl(req, file.filename));

    const newBag = await Bag.create(
      [{ name, price: Number(price), image: imageUrls, description, category, quantity: Number(quantity) }],
      { session }
    );

    await session.commitTransaction();
    return res.status(201).json(newBag[0]);
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ error: "Failed to save bag" });
  } finally {
    session.endSession();
  }
};

// ─── UPDATE  PUT /api/bags/:id ────────────────────────────────────────────────
// Multer field: upload.array("images", 5)
//
// Body fields:
//   name, price, description, category, quantity  — standard fields
//   existingImages  — JSON string of full URLs the user kept (in their chosen order)
//
// Final image array = keptExisting + newUploads  (both as full URLs, 1–5 total)
export const updateBag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, category, quantity, existingImages } = req.body;
  const newFiles = (req.files as Express.Multer.File[]) ?? [];

  // Parse the ordered list of kept existing image URLs sent by the frontend
  let keptUrls: string[] = [];
  try {
    keptUrls = existingImages ? JSON.parse(existingImages) : [];
  } catch {
    return res.status(400).json({ error: "Invalid existingImages JSON" });
  }

  // New uploads → full URLs (consistent with saveBag)
  const newImageUrls = newFiles.map((file) => toFullUrl(req, file.filename));

  // Merge: kept first (preserves user's drag order), then new uploads appended
  const allImages = [...keptUrls, ...newImageUrls];

  if (allImages.length === 0) {
    return res.status(400).json({ error: "At least one image is required" });
  }
  if (allImages.length > 5) {
    return res.status(400).json({ error: "Maximum 5 images allowed" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedBag = await Bag.findByIdAndUpdate(
      id,
      { name, price: Number(price), image: allImages, description, category, quantity: Number(quantity) },
      { new: true, session }
    );

    if (!updatedBag) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Bag not found" });
    }

    await session.commitTransaction();
    return res.status(200).json(updatedBag);
  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({ error: "Update failed" });
  } finally {
    session.endSession();
  }
};

// ─── READ ALL  GET /api/bags ──────────────────────────────────────────────────
export const getBags = async (req: Request, res: Response) => {
  try {
    const bags = await Bag.find();
    res.status(200).json(bags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bags" });
  }
};

// ─── READ ONE  GET /api/bags/:id ──────────────────────────────────────────────
export const getBagById = async (req: Request, res: Response) => {
  try {
    const bag = await Bag.findById(req.params.id);
    if (!bag) return res.status(404).json({ error: "Bag not found" });
    res.status(200).json(bag);
  } catch (error) {
    res.status(500).json({ error: "Invalid ID format" });
  }
};

// ─── DELETE  DELETE /api/bags/:id ─────────────────────────────────────────────
export const deleteBag = async (req: Request, res: Response) => {
  try {
    const deletedBag = await Bag.findByIdAndDelete(req.params.id);
    if (!deletedBag) return res.status(404).json({ error: "Bag not found" });
    res.status(200).json({ message: "Bag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};