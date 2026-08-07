import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Converts a JWT expiresIn string (e.g. '7d', '15m') into a future Date.
 */
export const expiresInToDate = (expiresIn) => {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) {
    // Fallback: assume seconds if it's a plain number, else 7 days
    const seconds = Number.isNaN(Number(expiresIn)) ? 7 * 24 * 60 * 60 : Number(expiresIn);
    return new Date(Date.now() + seconds * 1000);
  }
  const [, amount, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + Number(amount) * multipliers[unit]);
};
