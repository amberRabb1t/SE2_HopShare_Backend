import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { requestBodySchema, requestQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/requestController.js';
import { get as reqsServiceGet } from '../services/requestService.js';

const router = Router();

/*
  All the API endpoints required to perform CRUD operations on Requests.
  The routes are nested under /requests

  Example routes:
  - GET /requests
  - POST /requests
  - GET /requests/2
  - PUT /requests/2
  - DELETE /requests/2
*/

// List all requests with optional query parameters for filtering/pagination
router.get('/', validate({ query: requestQuerySchema }), controller.listRequests); // no authentication required

// Create request
router.post('/', 
  authRequired(), // Anonymous guests cannot create requests
  validate({ body: requestBodySchema }), 
  controller.createRequest
);

// Get request
router.get('/:requestID', controller.getRequest); // no authentication required

// Update request
router.put(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsServiceGet(Number(req.params.requestID))), // Only the owner of the request can modify it
  validate({ body: requestBodySchema }),
  controller.updateRequest
);

// Delete request
router.delete(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsServiceGet(Number(req.params.requestID))),  // Only the owner of the request can delete it
  controller.deleteRequest
);

export default router;

