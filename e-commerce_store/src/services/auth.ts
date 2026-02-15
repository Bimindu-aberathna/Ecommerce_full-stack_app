// Legacy compatibility wrapper for AuthService
// This file is deprecated - use AuthService directly or useAuth hook instead

import { AuthService } from './auth.service';

export const registerUser = AuthService.register;
export const loginUser = AuthService.login;
export const passwordReset = AuthService.resetPassword;