import type { Request,Response } from "express";

export const getBags = async (req: Request, res: Response) => {
    return res.send("Hello from getBags");
}