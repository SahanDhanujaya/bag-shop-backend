import express from 'express';
import { 
    createOrder, 
    getMyOrders, 
    getAllOrders, 
    updateOrderStatus 
} from '../controllers/order.controller.ts';
import { authenticateUser, authorizeRole } from '../middlewares/authMiddleware.ts';

const orderRouter = express.Router();
orderRouter.use(authenticateUser)

// All order routes require authentication

orderRouter.post('/', createOrder);           // Place a new order
orderRouter.get('/my-orders', getMyOrders);   // View logged-in user's orders
orderRouter.get('/admin/all', authorizeRole('admin'), getAllOrders);  // Admin: View everything
orderRouter.put('/:id/status', authorizeRole('admin'), updateOrderStatus); // Admin: Change status

export default orderRouter;