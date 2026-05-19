import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.ts";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bag-shop",
    allowed_formats: ["jpeg", "jpg", "png", "webp", "gif"],
    resource_type: "image",
  } as object,
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({
  storage,           // ← Cloudinary storage, not memoryStorage
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});