import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { reportBodySchema, reportQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/reportController.js';

const router = Router();

router.get('/',
    authRequired(),
    authorizeAdmin(),
    validate({ query: reportQuerySchema }),
    controller.listReports
);

router.post('/', 
    authRequired(), 
    validate({ body: reportBodySchema }), 
    controller.createReport
);

router.get('/:reportID',
    authRequired(),
    authorizeAdmin(),
    controller.getReport
);

export default router;

