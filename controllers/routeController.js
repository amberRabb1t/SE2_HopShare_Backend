import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as routes from '../services/routeService.js';

/**
 * List routes
 */
export async function listRoutes(req, res, next) {
  try {
    const data = await routes.list(req.query);
    return sendSuccess(res, data, 'Public routes retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create route
 */
export async function createRoute(req, res, next) {
  try {
    const created = await routes.create(req.body);
    return sendSuccess(res, created, 'Successfully created route', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get route
 */
export async function getRoute(req, res, next) {
  try {
    const item = await routes.get(Number(req.params.routeID));
    if (!item) throw new AppError('Route not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, item, 'Successfully retrieved route', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update route
 */
export async function updateRoute(req, res, next) {
  try {
    const updated = await routes.update(Number(req.params.routeID), req.body);
    if (!updated) throw new AppError('Route not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Successfully updated route', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete route
 */
export async function deleteRoute(req, res, next) {
  try {
    const ok = await routes.remove(Number(req.params.routeID));
    if (!ok) throw new AppError('Route not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Successfully deleted route', 200);
  } catch (err) {
    return next(err);
  }
}