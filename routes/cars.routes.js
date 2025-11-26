import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { carBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/carController.js';

const router = Router({ mergeParams: true });

router.get('/', controller.listCars);
router.post('/', authRequired(), validate({ body: carBodySchema }), controller.createCar);

router.get('/:carID', controller.getCar);
router.put('/:carID', authRequired(), validate({ body: carBodySchema }), controller.updateCar);
router.delete('/:carID', authRequired(), controller.deleteCar);

export default router;