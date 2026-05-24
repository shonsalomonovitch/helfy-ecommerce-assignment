import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { CartItem } from '../types/cart.types';

export const getUserCart = async (userId: number): Promise<CartItem[]> => {
  const query = `
    SELECT 
      ci.id,
      ci.product_id,
      p.name AS product_name,
      p.price AS product_price,
      p.image_url AS product_image_url,
      p.category,
      p.stock,
      ci.quantity,
      (p.price * ci.quantity) AS subtotal
    FROM cart_items ci
    INNER JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `;

  const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
  
  // Convert DECIMAL to number for proper JSON serialization
  return rows.map(row => ({
    ...row,
    product_price: parseFloat(row.product_price),
    subtotal: parseFloat(row.subtotal)
  })) as CartItem[];
};

export const addCartItem = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<void> => {
  // Check if product exists
  const [productRows] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM products WHERE id = ?',
    [productId]
  );

  if (productRows.length === 0) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  // Check if item already exists in cart
  const [existingRows] = await pool.query<RowDataPacket[]>(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );

  if (existingRows.length > 0) {
    // Update existing cart item by increasing quantity
    const newQuantity = existingRows[0].quantity + quantity;
    await pool.query(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQuantity, existingRows[0].id]
    );
  } else {
    // Insert new cart item
    await pool.query(
      'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [userId, productId, quantity]
    );
  }
};

export const updateCartItem = async (
  userId: number,
  productId: number,
  quantity: number
): Promise<boolean> => {
  if (quantity === 0) {
    // Remove item if quantity is 0
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  // Update quantity
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
    [quantity, userId, productId]
  );

  return result.affectedRows > 0;
};

export const removeCartItem = async (
  userId: number,
  productId: number
): Promise<void> => {
  await pool.query(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  // Idempotent - doesn't throw error if item doesn't exist
};
