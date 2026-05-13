import mongoose from "mongoose";

const BagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true // Changed to true for a shop
    },
    // Updated to support 1-5 image URLs
    image: {
        type: [String], 
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

export const Bag = mongoose.model('Bag', BagSchema);