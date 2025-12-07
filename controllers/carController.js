import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as cars from '../services/carService.js';

/**
 * List user's cars
 */
export async function listCars(req, res, next) {
  try {
    const list = await cars.list(Number(req.params.userID));
    return sendSuccess(res, list, "User's car list retrieved successfully", 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create car
 */
export async function createCar(req, res, next) {
  try {
    const created = await cars.create(Number(req.params.userID), req.body);
    return sendSuccess(res, created, 'Car added successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get car
 */
export async function getCar(req, res, next) {
  try {
    const car = await cars.get(Number(req.params.userID), Number(req.params.carID));
    if (!car) throw new AppError('Car or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, car, 'Car retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update car
 */
export async function updateCar(req, res, next) {
  try {
    const updated = await cars.update(Number(req.params.userID), Number(req.params.carID), req.body);
    if (!updated) throw new AppError('Car or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Car updated successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete car
 */
export async function deleteCar(req, res, next) {
  try {
    const ok = await cars.remove(Number(req.params.userID), Number(req.params.carID));
    if (!ok) throw new AppError('Car or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Car deleted successfully', 204);
  } catch (err) {
    return next(err);
  }
}

