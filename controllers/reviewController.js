import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as reviews from '../services/reviewService.js';

/**
 * List reviews
 */
export async function listUserReviews(req, res, next) {
  try {
    const myReviews = typeof req.query.myReviews === 'boolean' ? req.query.myReviews : undefined;
    const data = await reviews.list(Number(req.params.userID), myReviews);
    return sendSuccess(res, data, 'List of reviews retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create review
 */
export async function createReview(req, res, next) {
  try {
    const created = await reviews.create(Number(req.params.userID), req.body);
    return sendSuccess(res, created, 'Review added successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get review
 */
export async function getReview(req, res, next) {
  try {
    const item = await reviews.get(Number(req.params.userID), Number(req.params.reviewID));
    if (!item) throw new AppError('Review or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, item, 'Review retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update review
 */
export async function updateReview(req, res, next) {
  try {
    const updated = await reviews.update(Number(req.params.userID), Number(req.params.reviewID), req.body);
    if (!updated) throw new AppError('Review or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Review updated successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete review
 */
export async function deleteReview(req, res, next) {
  try {
    const ok = await reviews.remove(Number(req.params.userID), Number(req.params.reviewID));
    if (!ok) throw new AppError('Review or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Review deleted successfully', 204);
  } catch (err) {
    return next(err);
  }
}

