import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import Joi from 'joi';
import { reviewBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/reviewController.js';

const router = Router({ mergeParams: true });

const reviewsQuerySchema = Joi.object({
  myReviews: Joi.boolean()
});

router.get('/', validate({ query: reviewsQuerySchema }), controller.listUserReviews);
router.post('/', authRequired(), validate({ body: reviewBodySchema }), controller.createReview);

router.get('/:reviewID', controller.getReview);
router.put('/:reviewID', authRequired(), validate({ body: reviewBodySchema }), controller.updateReview);
router.delete('/:reviewID', authRequired(), controller.deleteReview);

export default router;