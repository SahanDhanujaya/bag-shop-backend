import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    cartItems: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const Order = mongoose.model('Order', OrderSchema);