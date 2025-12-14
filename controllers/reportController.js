import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as reports from '../services/reportService.js';

/**
 * File report
 */
export async function createReport(req, res, next) {
  try {
    const payload = { ...req.body };
    payload.UserID = Number(req.IDtoSet);
    const created = await reports.create(payload);
    return sendSuccess(res, created, 'Successfully filed report', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * List reports
 */
export async function listReports(req, res, next) {
  try {
    const filters = { ...req.query };
    const data = await reports.list(filters);
    return sendSuccess(res, data, 'Reports retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get report
 */
export async function getReport(req, res, next) {
  try {
    const rep = await reports.get(Number(req.params.reportID));
    if (!rep) throw new AppError('Report not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, rep, 'Successfully retrieved report', 200);
  } catch (err) {
    return next(err);
  }
}

