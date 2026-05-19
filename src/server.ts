import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { dbConnectin } from "./db/db.ts";
import authRouter from "./routes/auth.routes.ts";
import bagRoutes from "./routes/bag.routes.ts";
import orderRouter from "./routes/order.routes.ts";
import userRouter from "./routes/user.routes.ts";
import { configureCloudinary } from "./config/cloudinary.ts";

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

// Routes
app.use("/api/auth", authRouter);
app.use("/api/bags", bagRoutes);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 5000;

dbConnectin()
  .then(() => {
    configureCloudinary();
    app.listen(PORT, () => {
      console.log(`✅ Server definitely running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Critical failure during startup:", err);
  });