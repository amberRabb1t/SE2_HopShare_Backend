import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { usersQuerySchema, userBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/userController.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router();

router.get('/', validate({ query: usersQuerySchema }), controller.listUsers);
router.post('/', validate({ body: userBodySchema }), controller.createUser);

router.get('/:userID', controller.getUser);

// Only the owner of the user account can update it
router.put(
  '/:userID',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: userBodySchema }),
  controller.updateUser
);

// Only the owner of the user account can delete it
router.delete(
  '/:userID',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  controller.deleteUser
);

export default router;

