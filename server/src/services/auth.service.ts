import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { SignupRequestBody, LoginRequestBody, AuthUser, JwtPayload } from '../types/auth.types';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

function createError(message: string, status: number, code: string): Error & { status: number; code: string } {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = status;
  err.code = code;
  return err;
}

function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');

  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(payload as object, secret, { expiresIn });
}

export const signup = async (body: SignupRequestBody): Promise<{ token: string; user: AuthUser }> => {
  const { name, email, password } = body;

  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  if (existing.length > 0) {
    throw createError('Email already exists', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );

  const userId = result.insertId;
  const token = generateToken({ userId, email });

  return {
    token,
    user: { id: userId, name, email },
  };
};

export const login = async (body: LoginRequestBody): Promise<{ token: string; user: AuthUser }> => {
  const { email, password } = body;

  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, name, email, password_hash FROM users WHERE email = ?',
    [email]
  );

  const invalidCredentials = createError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  if (rows.length === 0) throw invalidCredentials;

  const user = rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw invalidCredentials;

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const getUserById = async (userId: number): Promise<AuthUser | null> => {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, name, email, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) return null;

  const { id, name, email, created_at } = rows[0];
  return { id, name, email, created_at };
};
