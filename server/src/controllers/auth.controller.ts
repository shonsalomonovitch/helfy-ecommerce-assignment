import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { SignupRequestBody, LoginRequestBody } from '../types/auth.types';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as SignupRequestBody;

    if (!name || !email || !password) {
      res.status(400).json({
        error: { message: 'Name, email, and password are required', code: 'VALIDATION_ERROR', status: 400 },
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: { message: 'Invalid email format', code: 'VALIDATION_ERROR', status: 400 },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: { message: 'Password must be at least 6 characters', code: 'VALIDATION_ERROR', status: 400 },
      });
      return;
    }

    const result = await authService.signup({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequestBody;

    if (!email || !password) {
      res.status(400).json({
        error: { message: 'Email and password are required', code: 'VALIDATION_ERROR', status: 400 },
      });
      return;
    }

    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await authService.getUserById(userId);
    if (!user) {
      res.status(404).json({
        error: { message: 'User not found', code: 'USER_NOT_FOUND', status: 404 },
      });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
