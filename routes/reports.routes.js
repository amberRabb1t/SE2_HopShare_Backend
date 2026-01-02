import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeAdmin } from '../middleware/authorize.js';
import { reportBodySchema, reportQuerySchema } from '../utils/validators.js';
import * as controller from '../controllers/reportController.js';

const router = Router();

/*
  All the API endpoints required to perform CRUD operations on Reports.
  The routes are nested under /reports

  Example routes:
  - GET /reports
  - POST /reports
  - GET /reports/2
*/

// List reports
router.get('/',
    authRequired(),
    authorizeAdmin(), // Only admin users can see all reports
    validate({ query: reportQuerySchema }),
    controller.listReports
);

// Create report
router.post('/', 
    authRequired(), // Anonymous guests cannot report users
    validate({ body: reportBodySchema }), 
    controller.createReport
);

// Get report
router.get('/:reportID',
    authRequired(),
    authorizeAdmin(), // Same for specific reports; admins only
    controller.getReport
);

export default router;

