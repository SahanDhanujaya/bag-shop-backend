import type { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebase.ts";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Extract the role from the token's custom claims
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role, // Role is now accessible here
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token" });
  }
};

export const authorizeRole = (requiredRole: 'admin' | 'customer') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user || user.role !== requiredRole) {
            return res.status(403).json({ 
                error: `Access denied. Requires ${requiredRole} role.` 
            });
        }
        next();
    };
};
