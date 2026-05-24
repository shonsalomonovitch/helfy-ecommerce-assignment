import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { Product, ProductFilters } from '../types/product.types';

export const getAllProducts = async (filters: ProductFilters): Promise<Product[]> => {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: (string | number)[] = [];

  // Apply search filter (name or description)
  if (filters.search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern);
  }

  // Apply category filter
  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  // Apply minPrice filter
  if (filters.minPrice !== undefined) {
    query += ' AND price >= ?';
    params.push(filters.minPrice);
  }

  // Apply maxPrice filter
  if (filters.maxPrice !== undefined) {
    query += ' AND price <= ?';
    params.push(filters.maxPrice);
  }

  query += ' ORDER BY created_at DESC';

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as Product[];
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const query = 'SELECT * FROM products WHERE id = ?';
  const [rows] = await pool.query<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as Product;
};
