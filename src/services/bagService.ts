import type { Request,Response } from "express";
import { Bag } from "../models/bag.ts";
import mongoose from "mongoose";

export const getBags = async (req: Request, res: Response) => {
    return res.send("Hello from getBags");
}

export const saveBags = async (req: Request, res: Response) => {
    const formData = req.body as FormData;
    if (!formData) {
        return res.status(400).json({ error: "Invalid form data" });
    }
    const session = await mongoose.startSession();
    session.startTransaction();

    const image = formData.get("image") as File;

    if (!image) {
        return res.status(400).json({ error: "Image is required" });
    }

    const imageBuffer = await image.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: image.type });
    const imageFile = new File([imageBlob], image.name, { type: image.type });
    formData.set("image", imageFile);
0
    await Bag.create({
        name: formData.get("name") as string,
        price: formData.get("price") as unknown as number,
        image: formData.get("image") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        quantity: formData.get("quantity") as unknown as number,
    });

    return res.status(201).json({ message: "Bag saved successfully" });
}