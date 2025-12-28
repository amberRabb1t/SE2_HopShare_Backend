import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { routeBodySchema, routeQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/routeController.js';
import { get as routesServiceGet } from '../services/routeService.js';

const router = Router();

router.get('/', validate({ query: routeQuerySchema }), controller.listRoutes);

router.post('/', 
  authRequired(), // Anonymous guests cannot create routes
  validate({ body: routeBodySchema }), 
  controller.createRoute
);

router.get('/:routeID', controller.getRoute);

// Only the owner of the route can modify it
router.put(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))),
  validate({ body: routeBodySchema }),
  controller.updateRoute
);

// Only the owner of the route can delete it
router.delete(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))),
  controller.deleteRoute
);

export default router;

