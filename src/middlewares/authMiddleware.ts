import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string | null;
        role: "admin" | "customer";
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.cookies?.token;

  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "customer",
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to restrict access based on roles.
 */
export const authorizeRole = (requiredRole: "admin" | "customer") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No user found in request" });
    }

    if (!user || user.role !== requiredRole) {
      return res.status(403).json({
        error: `Access denied. Requires ${requiredRole} role.`,
      });
    }
    next();
  };
};
