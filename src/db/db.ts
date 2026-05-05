import mongoose from "mongoose";

export const dbConnectin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log("✅ Database connected");
    } catch (error) {
        console.log("❌ Database connection failed", error);
    }
}
export default dbConnectin;