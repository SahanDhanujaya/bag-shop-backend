import { Router } from "express";
import { getBags } from "../services/bagService.ts";
import { authenticateUser } from "../middlewares/authMiddleware.ts";

const bagRoutes = Router();

bagRoutes.get("/", authenticateUser, getBags);
export default bagRoutes;