import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

// Public routes - no authentication required
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

export default router;
