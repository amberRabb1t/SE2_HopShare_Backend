import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { usersQuerySchema, userBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/userController.js';

const router = Router();

router.get('/', validate({ query: usersQuerySchema }), controller.listUsers);
router.post('/', validate({ body: userBodySchema }), controller.createUser);

router.get('/:userID', controller.getUser);
router.put('/:userID', authRequired(), validate({ body: userBodySchema }), controller.updateUser);
router.delete('/:userID', authRequired(), controller.deleteUser);

export default router;