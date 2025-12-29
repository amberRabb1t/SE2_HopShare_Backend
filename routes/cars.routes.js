import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { carBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/carController.js';
import { get as carServiceGet } from '../services/carService.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router({ mergeParams: true });

/*
  All the API endpoints required to perform CRUD operations on Cars.
  The routes are nested under /users/:userID/cars

  Example routes:
  - GET /users/1/cars
  - GET /users/1/cars/2
  - POST /users/1/cars
  - PUT /users/1/cars/2
  - DELETE /users/1/cars/2
*/

// List user's cars
router.get('/', controller.listCars); // no authentication required

// Get user's car
router.get('/:carID', controller.getCar); // no authentication required

// Add car to user's account
router.post(
  '/',
  authRequired(),
  // Only the user specified in the API endpoint (by userID) can add a car to their account
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: carBodySchema }),
  controller.createCar
);

// Update car
router.put(
  '/:carID',
  authRequired(),
  // Only the owner of the car can update it
  authorizeOwner(async (req) => carServiceGet(Number(req.params.userID), Number(req.params.carID))),
  validate({ body: carBodySchema }),
  controller.updateCar
);

// Delete car
router.delete(
  '/:carID',
  authRequired(),
  // Only the owner of the car can delete it
  authorizeOwner(async (req) => carServiceGet(Number(req.params.userID), Number(req.params.carID))),
  controller.deleteCar
);

export default router;

