import { v4 as uuidv4 } from 'uuid';
import userRepository from '../repositories/user.repository.js';
import refreshTokenRepository from '../repositories/refreshToken.repository.js';
import roleRepository from '../repositories/role.repository.js';
import {
  hashPassword,
  comparePassword,
  generateSecureToken,
  hashToken,
} from '../utils/password.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  expiresInToDate,
} from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { ROLES } from '../constants/roles.js';
import logger from '../config/logger.js';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from './email.service.js';
import { notifyNewLogin } from './notification.service.js';
import { recordAudit } from './audit.service.js';
import vehicleOwnerRepository from '../repositories/vehicleOwner.repository.js';
import prisma from '../config/database.js';

const sanitizeUser = (user) => {
  /* eslint-disable no-unused-vars */
  const {
    password,
    passwordResetToken,
    passwordResetExpires,
    emailVerificationToken,
    ...safeUser
  } = user;
  /* eslint-enable no-unused-vars */
  return {
    ...safeUser,
    permissions: user.role?.rolePermissions?.map((rp) => rp.permission.name) || undefined,
  };
};

const issueTokens = async (user, req) => {
  const accessToken = signAccessToken({ sub: user.id, roleId: user.roleId });
  const refreshTokenValue = signRefreshToken({ sub: user.id, jti: uuidv4() });

  await refreshTokenRepository.create({
    token: refreshTokenValue,
    userId: user.id,
    expiresAt: expiresInToDate(env.jwt.refreshExpiresIn),
    userAgent: req?.headers?.['user-agent'] || null,
    ipAddress: req?.ip || null,
  });

  return { accessToken, refreshToken: refreshTokenValue };
};

export const register = async (payload, req) => {
  const existing = await userRepository.findByEmailIncludingDeleted(payload.email);
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Default new self-registered users to the "Vehicle Owner" role unless
  // explicitly created by an admin through the User Management module.
  const defaultRole = await roleRepository.findByName(ROLES.VEHICLE_OWNER);
  if (!defaultRole) {
    throw ApiError.internal('Default role is not configured. Please run the database seed.');
  }

  const hashedPassword = await hashPassword(payload.password);
  const { rawToken, hashedToken } = generateSecureToken();

  // Full-info signup: the owner profile is created in the same atomic step
  // so a citizen never has to visit a separate "complete your profile" page
  // before they can request a vehicle registration, and a failure partway
  // through never leaves an orphaned user account with no profile.
  const existingByDocs = await vehicleOwnerRepository.findByCitizenshipOrLicense(
    payload.citizenshipNumber,
    payload.licenseNumber
  );
  if (existingByDocs) {
    throw ApiError.conflict(
      'An owner profile with this citizenship or license number already exists'
    );
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        password: hashedPassword,
        roleId: defaultRole.id,
        emailVerificationToken: hashedToken,
      },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });

    await tx.vehicleOwner.create({
      data: {
        userId: created.id,
        fullName: payload.fullName,
        address: payload.address,
        citizenshipNumber: payload.citizenshipNumber,
        licenseNumber: payload.licenseNumber,
        phone: payload.phone,
        email: payload.email,
      },
    });

    return created;
  });

  try {
    await sendEmailVerificationEmail(
      user.email,
      rawToken,
      `${env.appUrl}/api/${env.apiVersion}/auth/verify-email`
    );
  } catch (err) {
    // Account already exists at this point — a broken SMTP config shouldn't
    // block registration. Log it and let the user proceed; they can still
    // log in normally.
    logger.error(`Verification email failed to send for ${user.email}: ${err.message}`);
  }

  const tokens = await issueTokens(user, req);
  await recordAudit({ userId: user.id, action: 'USER_CREATED', details: { self: true }, req });

  return { user: sanitizeUser(user), ...tokens };
};

export const login = async (email, password, req) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw ApiError.forbidden('Your account is not active. Please contact an administrator.');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokens(user, req);
  await userRepository.update(user.id, { lastLoginAt: new Date() });
  await recordAudit({ userId: user.id, action: 'LOGIN', req });
  await notifyNewLogin(user, req);

  return { user: sanitizeUser(user), ...tokens };
};

export const logout = async (refreshTokenValue, userId, req) => {
  const stored = await refreshTokenRepository.findByToken(refreshTokenValue);
  if (stored) {
    await refreshTokenRepository.revoke(stored.id);
  }
  await recordAudit({ userId, action: 'LOGOUT', req });
  return true;
};

export const refreshTokens = async (refreshTokenValue, req) => {
  if (!refreshTokenValue) {
    throw ApiError.unauthorized('Refresh token missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await refreshTokenRepository.findByToken(refreshTokenValue);
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  const user = await userRepository.findById(decoded.sub);
  if (!user || user.status !== 'ACTIVE') {
    throw ApiError.unauthorized('User is not active');
  }

  // Rotate refresh token: revoke old, issue new
  await refreshTokenRepository.revoke(stored.id);
  const tokens = await issueTokens(user, req);

  return { user: sanitizeUser(user), ...tokens };
};

export const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  // Always respond success-shaped to avoid leaking which emails are registered;
  // controller returns a generic message regardless of this function's outcome.
  if (!user) return;

  const { rawToken, hashedToken } = generateSecureToken();
  await userRepository.update(user.id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  try {
    await sendPasswordResetEmail(user.email, rawToken, `${env.clientUrl}/reset-password`);
  } catch (err) {
    logger.error(`Password reset email failed to send for ${user.email}: ${err.message}`);
  }
};

export const resetPassword = async (rawToken, newPassword) => {
  const hashedToken = hashToken(rawToken);
  const user = await userRepository.findByPasswordResetToken(hashedToken);
  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.update(user.id, {
    password: hashedPassword,
    passwordResetToken: null,
    passwordResetExpires: null,
  });
  await refreshTokenRepository.revokeAllForUser(user.id);
  await recordAudit({ userId: user.id, action: 'PASSWORD_RESET' });
};

export const changePassword = async (userId, currentPassword, newPassword, req) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepository.update(userId, { password: hashedPassword });
  await refreshTokenRepository.revokeAllForUser(userId);
  await recordAudit({ userId, action: 'PASSWORD_CHANGED', req });
};

export const updateProfile = async (userId, payload, req) => {
  const user = await userRepository.update(userId, payload);
  await recordAudit({ userId, action: 'PROFILE_UPDATED', details: payload, req });
  return sanitizeUser(user);
};

export const verifyEmail = async (rawToken) => {
  const hashedToken = hashToken(rawToken);
  const user = await userRepository.findByEmailVerificationToken(hashedToken);
  if (!user) {
    throw ApiError.badRequest('Email verification token is invalid or has expired');
  }

  await userRepository.update(user.id, {
    isEmailVerified: true,
    emailVerificationToken: null,
  });
};

export { sanitizeUser };
