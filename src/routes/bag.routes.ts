import express from "express";
import { saveBag, updateBag, getBags, getBagById, deleteBag } from "../controllers/bag.controller.ts";
import { authenticateUser, authorizeRole } from "../middlewares/authMiddleware.ts";
import { upload } from "../middlewares/upload.middleware.ts";

const router = express.Router();

router.post( "/",    authenticateUser, authorizeRole("admin"), upload.array("images", 5), saveBag);
router.put(  "/:id", authenticateUser, authorizeRole("admin"), upload.array("images", 5), updateBag);

router.get(   "/",    getBags);
router.get(   "/:id", getBagById);
router.delete("/:id", authenticateUser, authorizeRole("admin"), deleteBag);

export default router;