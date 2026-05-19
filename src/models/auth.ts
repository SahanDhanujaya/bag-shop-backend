import { signInWithPopup } from "firebase/auth";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "customer"],
        default: "customer"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

export const User = mongoose.model("User", UserSchema);