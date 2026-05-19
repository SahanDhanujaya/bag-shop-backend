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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cookieParser());
const allowedOrigins = ["https://bag-shop-frontend.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRouter);
app.use("/api/bags", bagRoutes);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 5000;

dbConnectin()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server definitely running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Critical failure during startup:", err);
  });
