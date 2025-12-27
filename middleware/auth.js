import bcrypt from 'bcryptjs';
import { ERROR_CODES, AppError } from '../config/constants.js';
import { findByEmail as userServiceFindByEmail } from '../services/userService.js';

/**
 * Parse Basic Authorization header and return { username, password }.
 * @param {import('express').Request} req
 */
function parseBasicAuth(req) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Basic ')) return null;
  const base64 = header.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const idx = decoded.indexOf(':');
  if (idx === -1) return null;
  const username = decoded.slice(0, idx);
  const password = decoded.slice(idx + 1);
  return { username, password };
}

/**
 * Attempt to authenticate the user against DB or mock store.
 * Returns user object on success, throws AppError on failure.
 * @param {string} username email
 * @param {string} password plain
 */
async function authenticate(username, password) {
  const user = await userServiceFindByEmail(username);
  if (!user) {
    throw new AppError('Invalid credentials', 401, ERROR_CODES.UNAUTHORIZED);
  }
  const hash = user.Password;
  const matched = hash.startsWith('$2') ? await bcrypt.compare(password, hash) : password === hash;
  if (!matched) throw new AppError('Invalid credentials', 401, ERROR_CODES.UNAUTHORIZED);
  if (user.Banned) throw new AppError('User is banned', 403, ERROR_CODES.FORBIDDEN);
  return user;
}

/**
 * Enforce Basic auth for mutating endpoints or when explicitly used.
 * - If BASIC_AUTH_ENABLED=false, it becomes a no-op and always allows.
 * @returns {import('express').RequestHandler}
 */
export function authRequired() {
  const enabled = String(process.env.BASIC_AUTH_ENABLED || 'true').toLowerCase() === 'true';
  return async (req, _res, next) => {
    try {
      if (!enabled) return next();

      const creds = parseBasicAuth(req);
      if (!creds) throw new AppError('Missing Basic Authorization header', 401, ERROR_CODES.UNAUTHORIZED);

      const user = await authenticate(creds.username, creds.password);
      req.user = user;
      req.IDtoSet = user.UserID;

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Optional authentication: attaches req.user if valid, otherwise continues.
 * @returns {import('express').RequestHandler}
 */
export function authOptional() {
  return async (req, _res, next) => {
    try {
      const creds = parseBasicAuth(req);
      if (!creds) return next();
      try {
        const user = await authenticate(creds.username, creds.password);
        req.user = user;
      } catch {
        // ignore invalid credentials in optional mode
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

