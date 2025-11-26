import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as users from '../services/userService.js';

/**
 * List users
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function listUsers(req, res, next) {
  try {
    const list = await users.list(req.query.Name);
    return sendSuccess(res, list, 'User list retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create user
 */
export async function createUser(req, res, next) {
  try {
    const created = await users.create(req.body);
    return sendSuccess(res, created, 'Successfully created user', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get user
 */
export async function getUser(req, res, next) {
  try {
    const user = await users.get(Number(req.params.userID));
    if (!user) throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, user, 'Successfully retrieved user', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update user
 */
export async function updateUser(req, res, next) {
  try {
    const updated = await users.update(Number(req.params.userID), req.body);
    if (!updated) throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Successfully updated user', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete user
 */
export async function deleteUser(req, res, next) {
  try {
    const ok = await users.remove(Number(req.params.userID));
    if (!ok) throw new AppError('User not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Successfully deleted user', 200);
  } catch (err) {
    return next(err);
  }
}