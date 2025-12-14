import { Router } from 'express';
import usersRouter from './users.routes.js';
import routesRouter from './routes.routes.js';
import reportsRouter from './reports.routes.js';
import requestsRouter from './requests.routes.js';
import carsRouter from './cars.routes.js';
import conversationsRouter from './conversations.routes.js';
import reviewsRouter from './reviews.routes.js';

const router = Router();

// Top-level resources
router.use('/users', usersRouter);
router.use('/routes', routesRouter);
router.use('/reports', reportsRouter);
router.use('/requests', requestsRouter);

// Nested resources under users
router.use('/users/:userID/cars', carsRouter);
router.use('/users/:userID/conversations', conversationsRouter);
router.use('/users/:userID/reviews', reviewsRouter);

export default router;

