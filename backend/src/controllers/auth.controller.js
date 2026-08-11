import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as authService from '../services/auth.service.js';
import userRepository from '../repositories/user.repository.js';
import { sanitizeUser } from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  new ApiResponse(res, 201, 'Registration successful', result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, req);
  new ApiResponse(res, 200, 'Login successful', result);
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken, req.user?.id, req);
  new ApiResponse(res, 200, 'Logout successful', null);
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken, req);
  new ApiResponse(res, 200, 'Token refreshed successfully', result);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  new ApiResponse(
    res,
    200,
    'If an account with that email exists, a reset link has been sent',
    null
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  new ApiResponse(res, 200, 'Password has been reset successfully', null);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword, req);
  new ApiResponse(res, 200, 'Password changed successfully', null);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updated = await authService.updateProfile(req.user.id, req.body, req);
  new ApiResponse(res, 200, 'Profile updated successfully', updated);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.user.id);
  new ApiResponse(res, 200, 'Profile retrieved successfully', sanitizeUser(user));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  new ApiResponse(res, 200, 'Email verified successfully', null);
});
