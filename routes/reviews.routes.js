import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner } from '../middleware/authorize.js';
import Joi from 'joi';
import { reviewBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/reviewController.js';
import { get as reviewServiceGet } from '../services/reviewService.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router({ mergeParams: true });

const reviewsQuerySchema = Joi.object({
  myReviews: Joi.boolean()
});

router.get('/', validate({ query: reviewsQuerySchema }), controller.listUserReviews);

// Only the user specified in the API endpoint (by userID) can add a review to their account
router.post('/', 
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: reviewBodySchema }), 
  controller.createReview
);

router.get('/:reviewID', controller.getReview);

// Only the owner of the review can update it
router.put(
  '/:reviewID',
  authRequired(),
  authorizeOwner(async (req) => reviewServiceGet(Number(req.params.userID), Number(req.params.reviewID))),
  validate({ body: reviewBodySchema }),
  controller.updateReview
);

// Only the owner of the review can delete it
router.delete(
  '/:reviewID',
  authRequired(),
  authorizeOwner(async (req) => reviewServiceGet(Number(req.params.userID), Number(req.params.reviewID))),
  controller.deleteReview
);

export default router;

