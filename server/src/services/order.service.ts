import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';
import { Order, OrderWithItems, CheckoutCartItem, OrderItem } from '../types/order.types';

/**
 * Create an order from the user's cart with transaction safety
 * This function:
 * 1. Fetches cart items with current prices from database
 * 2. Validates cart is not empty
 * 3. Calculates total from database prices (never trust frontend)
 * 4. Creates order record
 * 5. Creates order_items with product snapshot
 * 6. Clears user's cart
 * All operations are atomic - if any step fails, everything rolls back
 */
export const createOrderFromCart = async (
  userId: number,
  shippingName: string,
  shippingAddress: string,
  shippingCity: string,
  shippingCountry: string
): Promise<Order> => {
  let connection: PoolConnection | null = null;

  try {
    // Get a connection from the pool for transaction
    connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();

    // Fetch cart items with current product prices from database
    const [cartRows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        ci.product_id,
        p.name AS product_name,
        p.price AS product_price,
        ci.quantity
      FROM cart_items ci
      INNER JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?`,
      [userId]
    );

    const cartItems = cartRows as CheckoutCartItem[];

    // Validate cart is not empty
    if (cartItems.length === 0) {
      throw new Error('CART_EMPTY');
    }

    // Calculate total amount from database prices (server-side calculation)
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product_price.toString()) * item.quantity);
    }, 0);

    // Create order record
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO orders 
        (user_id, total_amount, status, shipping_name, shipping_address, shipping_city, shipping_country) 
      VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
      [userId, totalAmount, shippingName, shippingAddress, shippingCity, shippingCountry]
    );

    const orderId = orderResult.insertId;

    // Create order_items with product snapshot
    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_id, product_name, product_price, quantity) 
        VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.product_name, item.product_price, item.quantity]
      );
    }

    // Clear user's cart after successful order creation
    await connection.query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    // Commit transaction - all operations succeeded
    await connection.commit();

    // Fetch and return the created order
    const [orderRows] = await connection.query<RowDataPacket[]>(
      `SELECT 
        id, user_id, total_amount, status, 
        shipping_name, shipping_address, shipping_city, shipping_country, 
        created_at
      FROM orders 
      WHERE id = ?`,
      [orderId]
    );

    const order = orderRows[0] as Order;
    
    // Convert DECIMAL to number for proper JSON serialization
    return {
      ...order,
      total_amount: parseFloat(order.total_amount.toString())
    };

  } catch (error) {
    // Rollback transaction on any error
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    // Always release connection back to pool
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Get order history for a user with nested order items
 * Returns orders sorted by created_at DESC (newest first)
 * Only returns orders belonging to the authenticated user
 */
export const getUserOrders = async (userId: number): Promise<OrderWithItems[]> => {
  // Fetch user's orders
  const [orderRows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      id, total_amount, status, 
      shipping_name, shipping_address, shipping_city, shipping_country, 
      created_at
    FROM orders 
    WHERE user_id = ?
    ORDER BY created_at DESC`,
    [userId]
  );

  const orders = orderRows as Omit<Order, 'user_id'>[];

  // Fetch order items for all orders
  const ordersWithItems: OrderWithItems[] = [];

  for (const order of orders) {
    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        id, product_id, product_name, product_price, quantity
      FROM order_items 
      WHERE order_id = ?`,
      [order.id]
    );

    const items = itemRows.map(row => ({
      ...row,
      product_price: parseFloat(row.product_price)
    })) as OrderItem[];

    ordersWithItems.push({
      ...order,
      total_amount: parseFloat(order.total_amount.toString()),
      items
    });
  }

  return ordersWithItems;
};
