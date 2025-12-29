import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { routeBodySchema, routeQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/routeController.js';
import { get as routesServiceGet } from '../services/routeService.js';

const router = Router();

/*
  All the API endpoints required to perform CRUD operations on Routes.
  The routes are nested under /routes

  Example routes:
  - GET /routes
  - POST /routes
  - GET /routes/2
  - PUT /routes/2
  - DELETE /routes/2
*/

// List all routes with optional query parameters for filtering
router.get('/', validate({ query: routeQuerySchema }), controller.listRoutes); // no authentication required

// Create route
router.post('/', 
  authRequired(), // Anonymous guests cannot create routes
  validate({ body: routeBodySchema }), 
  controller.createRoute
);

// Get route
router.get('/:routeID', controller.getRoute); // no authentication required

// Update route
router.put(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))), // Only the owner of the route can modify it
  validate({ body: routeBodySchema }),
  controller.updateRoute
);

// Delete route
router.delete(
  '/:routeID',
  authRequired(),
  authorizeOwner(async (req) => routesServiceGet(Number(req.params.routeID))), // Only the owner of the route can delete it
  controller.deleteRoute
);

export default router;

