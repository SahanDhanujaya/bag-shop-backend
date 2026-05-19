import type { Request, Response } from "express";
import { signInWithEmailAndPassword } from "firebase/auth";
import { adminAuth, clientAuth } from "../config/firebase.ts";
import { User } from "../models/auth.ts";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role, address } = req.body;

  // Start the Mongoose session
  const session = await mongoose.startSession();
  session.startTransaction();

  // Keep track of Firebase UID so we can clean it up if MongoDB fails
  let createdFirebaseUid: string | null = null;

  try {
    // 1. Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    if (!userRecord) {
      throw new Error("Firebase user registration failed");
    }

    // Track the UID immediately upon successful creation
    createdFirebaseUid = userRecord.uid;

    // 2. Set Custom Claims in Firebase
    const userRole = role || "customer"; // Default to customer if not provided
    await adminAuth.setCustomUserClaims(createdFirebaseUid, { role: userRole });

    // 3. Save User to MongoDB (CRITICAL: Pass the session here)
    // Note: For MongoDB, explicitly store the Firebase UID either as _id or uid depending on your schema setup
    const [user] = await User.create(
      [
        {
          _id: createdFirebaseUid, // Or uid: createdFirebaseUid depending on your previous setup
          name,
          email,
          password,
          address,
          role: userRole,
        },
      ],
      { session }, // This links this operation to the transaction
    );

    if (!user) {
      throw new Error("MongoDB user document creation failed");
    }

    // If everything succeeded, commit the MongoDB transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "User registered successfully",
      uid: createdFirebaseUid,
    });
  } catch (error: any) {
    // 4. ROLLBACK STRATEGY

    // Roll back MongoDB changes
    await session.abortTransaction();
    session.endSession();

    // Roll back Firebase Auth changes manually if a user was created
    if (createdFirebaseUid) {
      try {
        await adminAuth.deleteUser(createdFirebaseUid);
      } catch (firebaseDeleteError) {
        return res
          .status(500)
          .json({ error: "Failed to delete Firebase user" });
        // At this point, your DB is clean but Firebase has a stranded user.
        // You may want to log this to a special error monitoring tool.
      }
    }

    return res
      .status(500)
      .json({ error: error.message || "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password,
    );
    const user = userCredential.user;

    // FORCE REFRESH (true) ensures the 'role' claim is included in the token
    const idTokenResult = await user.getIdTokenResult(true);

    res.cookie("token", idTokenResult.token, {
      httpOnly: true,
      secure: true, // REQUIRED for cross-domain cookies
      sameSite: "none", // REQUIRED for cross-domain cookies
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      message: "Login successful",
      uid: user.uid,
      accessToken: idTokenResult.token, // This is the valid JWT
      refreshToken: user.refreshToken,
      expiresIn: idTokenResult.expirationTime,
      role: idTokenResult.claims.role || "customer",
    });
  } catch (error: any) {
    res.status(401).json({ error: "Invalid email or password" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
