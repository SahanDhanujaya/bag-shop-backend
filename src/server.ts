import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnectin } from "./db/db.ts";
import authRouter from "./routes/auth.routes.ts";
import bagRoutes from "./routes/bag.routes.ts";
import orderRouter from "./routes/order.routes.ts";
import userRouter from "./routes/user.routes.ts";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.enable("trust proxy");
app.use(cookieParser());

// 1. UPDATED CORS: Added your Vercel frontend URL so production requests aren't blocked
app.use(
  cors({
    origin: ["http://localhost:3000", "https://bag-shop-frontend.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// 2. ROBUST STATIC PATH RESOLUTION
// Uses path.resolve to confidently target the root 'uploads' folder relative to this file
const uploadsDir = path.resolve(__dirname, "../uploads");

// Automatically recreates the uploads folder if Render's ephemeral system wipes it out
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created missing uploads directory at:", uploadsDir);
}

// Serve the directory statically
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/bags", bagRoutes);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 5000;

dbConnectin()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server definitely running on port ${PORT}`);
      console.log(`📂 Serving static uploads from: ${uploadsDir}`);
    });
  })
  .catch((err) => {
    console.error("Critical failure during startup:", err);
  });