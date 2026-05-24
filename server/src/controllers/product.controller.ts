import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { ProductFilters } from '../types/product.types';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filters: ProductFilters = {};

    // Parse query parameters
    if (req.query.search) {
      filters.search = req.query.search as string;
    }

    if (req.query.category) {
      filters.category = req.query.category as string;
    }

    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice as string);
      if (isNaN(minPrice) || minPrice < 0) {
      res.status(400).json({
        error: {
          message: 'Invalid minPrice parameter',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
        return;
      }
      filters.minPrice = minPrice;
    }

    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice as string);
      if (isNaN(maxPrice) || maxPrice < 0) {
      res.status(400).json({
        error: {
          message: 'Invalid maxPrice parameter',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
        return;
      }
      filters.maxPrice = maxPrice;
    }

    // Validate price range
    if (
      filters.minPrice !== undefined &&
      filters.maxPrice !== undefined &&
      filters.minPrice > filters.maxPrice
    ) {
      res.status(400).json({
        error: {
          message: 'minPrice cannot be greater than maxPrice',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    const products = await productService.getAllProducts(filters);

    res.status(200).json({
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = parseInt(req.params.id as string, 10);

    if (isNaN(productId) || productId <= 0) {
      res.status(400).json({
        error: {
          message: 'Invalid product ID',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      res.status(404).json({
        error: {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
          status: 404,
        },
      });
      return;
    }

    res.status(200).json({
      product,
    });
  } catch (error) {
    next(error);
  }
};
