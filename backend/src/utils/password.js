import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, env.bcrypt.saltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generates a secure random token (used for password reset / email verification)
 * and its SHA-256 hash. Only the hash is stored in the DB; the raw token is sent
 * to the user via email/response.
 */
export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

export const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex');
