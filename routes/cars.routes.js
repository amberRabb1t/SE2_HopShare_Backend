import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { carBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/carController.js';
import { get as carServiceGet } from '../services/carService.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router({ mergeParams: true });

router.get('/', controller.listCars);
router.get('/:carID', controller.getCar);

// Only the user specified in the API endpoint (by userID) can add a car to their account 
router.post(
  '/',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: carBodySchema }),
  controller.createCar
);

// Only the owner of the car can update it
router.put(
  '/:carID',
  authRequired(),
  authorizeOwner(async (req) => carServiceGet(Number(req.params.userID), Number(req.params.carID))),
  validate({ body: carBodySchema }),
  controller.updateCar
);

// Only the owner of the car can delete it
router.delete(
  '/:carID',
  authRequired(),
  authorizeOwner(async (req) => carServiceGet(Number(req.params.userID), Number(req.params.carID))),
  controller.deleteCar
);

export default router;

