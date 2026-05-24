import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { CreateOrderRequestBody } from '../types/order.types';

/**
 * POST /api/orders
 * Create an order from the authenticated user's cart (checkout)
 */
export const createOrder = async (
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

    const {
      shipping_name,
      shipping_address,
      shipping_city,
      shipping_country,
    } = req.body as CreateOrderRequestBody;

    // Validate required shipping fields
    if (!shipping_name || typeof shipping_name !== 'string' || shipping_name.trim() === '') {
      res.status(400).json({
        error: {
          message: 'shipping_name is required',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    if (!shipping_address || typeof shipping_address !== 'string' || shipping_address.trim() === '') {
      res.status(400).json({
        error: {
          message: 'shipping_address is required',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    if (!shipping_city || typeof shipping_city !== 'string' || shipping_city.trim() === '') {
      res.status(400).json({
        error: {
          message: 'shipping_city is required',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    if (!shipping_country || typeof shipping_country !== 'string' || shipping_country.trim() === '') {
      res.status(400).json({
        error: {
          message: 'shipping_country is required',
          code: 'VALIDATION_ERROR',
          status: 400,
        },
      });
      return;
    }

    try {
      // Create order from cart (with transaction safety)
      const order = await orderService.createOrderFromCart(
        req.user.userId,
        shipping_name.trim(),
        shipping_address.trim(),
        shipping_city.trim(),
        shipping_country.trim()
      );

      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error: any) {
      if (error.message === 'CART_EMPTY') {
        res.status(400).json({
          error: {
            message: 'Cannot create order from empty cart',
            code: 'CART_EMPTY',
            status: 400,
          },
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 * Get the authenticated user's order history with nested items
 */
export const getOrders = async (
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

    const orders = await orderService.getUserOrders(req.user.userId);

    res.status(200).json({
      orders,
    });
  } catch (error) {
    next(error);
  }
};
