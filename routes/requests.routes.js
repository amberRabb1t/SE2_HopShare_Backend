import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import { requestBodySchema, requestQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/requestController.js';
import * as reqsService from '../services/requestService.js';

const router = Router();

router.get('/', validate({ query: requestQuerySchema }), controller.listRequests);
router.post('/', authRequired(), validate({ body: requestBodySchema }), controller.createRequest);

router.get('/:requestID', controller.getRequest);

router.put(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsService.get(Number(req.params.requestID))),
  validate({ body: requestBodySchema }),
  controller.updateRequest
);

router.delete(
  '/:requestID',
  authRequired(),
  authorizeOwner(async (req) => reqsService.get(Number(req.params.requestID))),
  controller.deleteRequest
);

export default router;