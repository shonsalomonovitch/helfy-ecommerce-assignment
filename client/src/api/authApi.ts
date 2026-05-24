import apiClient from './apiClient';
import type { AuthResponse, LoginRequest, SignupRequest, User } from '../types/auth.types';

// POST /api/auth/login
// Returns token and user on success.
export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/login', data).then((res) => res.data);

// POST /api/auth/signup
// Returns token and user on success.
export const signup = (data: SignupRequest): Promise<AuthResponse> =>
  apiClient.post<AuthResponse>('/api/auth/signup', data).then((res) => res.data);

// GET /api/auth/me
// Requires Authorization header (set automatically by apiClient interceptor).
// Backend wraps the user in { user: {...} } — we unwrap it here.
export const getCurrentUser = (): Promise<User> =>
  apiClient.get<{ user: User }>('/api/auth/me').then((res) => res.data.user);
