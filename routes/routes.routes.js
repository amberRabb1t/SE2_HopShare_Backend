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
  authRequired(), 
  validate({ body: routeBodySchema }), 
  controller.createRoute
);

router.get('/:routeID', controller.getRoute);

router.put(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))),
  validate({ body: routeBodySchema }),
  controller.updateRoute
);

router.delete(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))),
  controller.deleteRoute
);

export default router;

