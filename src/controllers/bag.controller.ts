import type { Request, Response } from "express";
import { Bag } from "../models/bag.ts";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const getPublicId = (url: string): string => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  if (!match) throw new Error(`Cannot extract public_id from URL: ${url}`);
  return match[1]; 
};

const isCloudinaryUrl = (url: string): boolean =>
  url.includes("res.cloudinary.com");

const deleteFromCloudinary = async (urls: string[]) => {
  const cloudinaryUrls = urls.filter(isCloudinaryUrl);
  if (cloudinaryUrls.length === 0) return;

  const publicIds = cloudinaryUrls.map(getPublicId);
  await cloudinary.api.delete_resources(publicIds);
};

// ─── CREATE  POST /api/bags ───────────────────────────────────────────────────
export const saveBag = async (req: Request, res: Response) => {
  const { name, price, description, category, quantity } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0)
    return res.status(400).json({ error: "At least one image is required" });
  if (files.length > 5)
    return res.status(400).json({ error: "Maximum 5 images allowed" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const imageUrls = files.map((file) => file.path);

    const newBag = await Bag.create(
      [{ name, price: Number(price), image: imageUrls, description, category, quantity: Number(quantity) }],
      { session },
    );

    await session.commitTransaction();
    return res.status(201).json(newBag[0]);
  } catch (error) {
    await session.abortTransaction();
    // If DB fails, clean up the already-uploaded Cloudinary images
    await deleteFromCloudinary(files.map((f) => f.path)).catch(console.error);
    return res.status(500).json({ error: "Failed to save bag" });
  } finally {
    session.endSession();
  }
};

// ─── UPDATE  PUT /api/bags/:id ────────────────────────────────────────────────
export const updateBag = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, category, quantity, existingImages } = req.body;
  const newFiles = (req.files as Express.Multer.File[]) ?? [];

  let keptUrls: string[] = [];
  try {
    keptUrls = existingImages ? JSON.parse(existingImages) : [];
  } catch {
    return res.status(400).json({ error: "Invalid existingImages JSON" });
  }

  const newImageUrls = newFiles.map((file) => file.path);
  const allImages = [...keptUrls, ...newImageUrls];

  if (allImages.length === 0)
    return res.status(400).json({ error: "At least one image is required" });
  if (allImages.length > 5)
    return res.status(400).json({ error: "Maximum 5 images allowed" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existingBag = await Bag.findById(id).session(session);
    if (!existingBag) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Bag not found" });
    }

    // Determine which old images were removed by the user
    const removedUrls = (existingBag.image as string[]).filter(
      (url) => !keptUrls.includes(url)
    );

    const updatedBag = await Bag.findByIdAndUpdate(
      id,
      { name, price: Number(price), image: allImages, description, category, quantity: Number(quantity) },
      { new: true, session },
    );

    await session.commitTransaction();

    // Delete removed images from Cloudinary after successful DB update
    if (removedUrls.length > 0) {
      await deleteFromCloudinary(removedUrls).catch(console.error);
    }

    return res.status(200).json(updatedBag);
  } catch (error) {
    await session.abortTransaction();
    // Clean up any newly uploaded images if DB update failed
    await deleteFromCloudinary(newImageUrls).catch(console.error);
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

    // Delete all associated images from Cloudinary
    await deleteFromCloudinary(deletedBag.image as string[]).catch(console.error);

    res.status(200).json({ message: "Bag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};