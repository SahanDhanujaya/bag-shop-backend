import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: false // To track which Firebase user placed the order
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    total: { type: Number, required: true },
    cartItems: [
        {
            bagId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Bag', 
                required: true 
            },
            name: String,
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    status: {
        type: String,
        required: true,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Order = mongoose.model('Order', OrderSchema);