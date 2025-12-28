import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { requestBodySchema, requestQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/requestController.js';
import { get as reqsServiceGet } from '../services/requestService.js';

const router = Router();

router.get('/', validate({ query: requestQuerySchema }), controller.listRequests);

router.post('/', 
  authRequired(), // Anonymous guests cannot create requests
  validate({ body: requestBodySchema }), 
  controller.createRequest
);

router.get('/:requestID', controller.getRequest);

// Only the owner of the request can modify it
router.put(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsServiceGet(Number(req.params.requestID))),
  validate({ body: requestBodySchema }),
  controller.updateRequest
);

// Only the owner of the request can delete it
router.delete(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsServiceGet(Number(req.params.requestID))),
  controller.deleteRequest
);

export default router;

