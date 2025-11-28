import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as reqs from '../services/requestService.js';

/**
 * List requests
 */
export async function listRequests(req, res, next) {
  try {
    const data = await reqs.list(req.query);
    return sendSuccess(res, data, 'Public requests retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create request
 */
export async function createRequest(req, res, next) {
  try {
    const creatorId = req.user?.UserID;
    const payload = { ...req.body };
    if (creatorId) {
      payload.userID = Number(creatorId);
    }
    const created = await reqs.create(payload);
    return sendSuccess(res, created, 'Successfully created request', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get request
 */
export async function getRequest(req, res, next) {
  try {
    const item = await reqs.get(Number(req.params.requestID));
    if (!item) throw new AppError('Request not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, item, 'Successfully retrieved request', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update request
 */
export async function updateRequest(req, res, next) {
  try {
    const updated = await reqs.update(Number(req.params.requestID), req.body);
    if (!updated) throw new AppError('Request not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Successfully updated request', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete request
 */
export async function deleteRequest(req, res, next) {
  try {
    const ok = await reqs.remove(Number(req.params.requestID));
    if (!ok) throw new AppError('Request not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Successfully deleted request', 200);
  } catch (err) {
    return next(err);
  }
}