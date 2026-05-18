import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware.ts";
import { getUserProfile, updateUserProfile } from "../controllers/user.controller.ts";

const userRouter = Router();

userRouter.use(authenticateUser)

userRouter.get('/me', getUserProfile);
userRouter.put('/profile/update', updateUserProfile);

export default userRouter;