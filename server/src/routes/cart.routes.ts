import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', cartController.addCartItem);
router.put('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeCartItem);

export default router;
