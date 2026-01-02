import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { usersQuerySchema, userBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/userController.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router();

/*
  All the API endpoints required to perform CRUD operations on Users.
  The routes are nested under /users

  Example routes:
  - GET /users
  - POST /users
  - GET /users/2
  - PUT /users/2
  - DELETE /users/2
*/

// List users with optional query parameters
router.get('/', validate({ query: usersQuerySchema }), controller.listUsers); // authentication not required

// Create user
router.post('/', validate({ body: userBodySchema }), controller.createUser); // authentication not required

// Get user
router.get('/:userID', controller.getUser); // authentication not required

// Update user
router.put(
  '/:userID',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))), // Only the owner of the user account can update it
  validate({ body: userBodySchema }),
  controller.updateUser
);

// Delete user
router.delete(
  '/:userID',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))), // Only the owner of the user account can delete it
  controller.deleteUser
);

export default router;

