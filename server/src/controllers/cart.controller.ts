import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { AddCartItemRequestBody, UpdateCartItemRequestBody } from '../types/cart.types';

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
        },
      });
      return;
    }

    const cartItems = await cartService.getUserCart(req.user.userId);

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      cart: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
        },
      });
      return;
    }

    const { product_id, quantity } = req.body as AddCartItemRequestBody;

    // Validate product_id
    if (!product_id || typeof product_id !== 'number' || product_id <= 0) {
      res.status(400).json({
        error: {
          message: 'Invalid product_id',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    // Validate quantity
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      res.status(400).json({
        error: {
          message: 'Invalid quantity. Must be a positive number',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    try {
      await cartService.addCartItem(req.user.userId, product_id, quantity);
    } catch (error: any) {
      if (error.message === 'PRODUCT_NOT_FOUND') {
        res.status(404).json({
          error: {
            message: 'Product not found',
            code: 'PRODUCT_NOT_FOUND',
            status: 404,
          },
        });
        return;
      }
      throw error;
    }

    // Return updated cart
    const cartItems = await cartService.getUserCart(req.user.userId);
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(201).json({
      message: 'Product added to cart',
      cart: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
        },
      });
      return;
    }

    const productId = parseInt(req.params.productId as string, 10);
    const { quantity } = req.body as UpdateCartItemRequestBody;

    // Validate productId
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

    // Validate quantity
    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({
        error: {
          message: 'Invalid quantity. Must be a non-negative number',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    const updated = await cartService.updateCartItem(
      req.user.userId,
      productId,
      quantity
    );

    if (!updated) {
      res.status(404).json({
        error: {
          message: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND',
          status: 404,
        },
      });
      return;
    }

    // Return updated cart
    const cartItems = await cartService.getUserCart(req.user.userId);
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      message: quantity === 0 ? 'Product removed from cart' : 'Cart item updated',
      cart: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
        },
      });
      return;
    }

    const productId = parseInt(req.params.productId as string, 10);

    // Validate productId
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

    await cartService.removeCartItem(req.user.userId, productId);

    // Return updated cart
    const cartItems = await cartService.getUserCart(req.user.userId);
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.status(200).json({
      message: 'Product removed from cart',
      cart: {
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};
