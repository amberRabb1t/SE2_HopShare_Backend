import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { carBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/carController.js';
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
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: carBodySchema }),
  controller.updateCar
);

// Delete car
router.delete(
  '/:carID',
  authRequired(),
  // Only the owner of the car can delete it
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  controller.deleteCar
);

/*
  Note: checking if the actor-user is the user specified in the API endpoint
  is sufficient for authorization, because Cars are always accessed via a combination of
  their "CarID" and "UserID" fields. Therefore, attempting to access a Car that does not
  belong to "param-user" will fail at a later level (e.g., trying to get CarID=2
  for UserID=1 when CarID=2 actually has UserID=3 will return null/false).

  Therefore as long as "actor-user = param-user" we can safely authorize the action.
*/

export default router;

