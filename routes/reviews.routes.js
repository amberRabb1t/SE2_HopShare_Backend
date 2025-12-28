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

// Determines whether to list reviews the user has written or reviews about the user (or both if no filter is provided)
const reviewsQuerySchema = Joi.object({
  myReviews: Joi.boolean()
});

// List reviews for a user, with optional filtering
router.get('/', validate({ query: reviewsQuerySchema }), controller.listUserReviews); // no authentication required

// Add a review to a user's account
router.post('/', 
  authRequired(),
  // Only the user specified in the API endpoint (by userID) can add a review to their account
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: reviewBodySchema }), 
  controller.createReview
);

// Get review
router.get('/:reviewID', controller.getReview); // no authentication required

// Update review
router.put(
  '/:reviewID',
  authRequired(),
  // Only the owner of the review can update it
  authorizeOwner(async (req) => reviewServiceGet(Number(req.params.userID), Number(req.params.reviewID))),
  validate({ body: reviewBodySchema }),
  controller.updateReview
);

// Delete review
router.delete(
  '/:reviewID',
  authRequired(),
  // Only the owner of the review can delete it
  authorizeOwner(async (req) => reviewServiceGet(Number(req.params.userID), Number(req.params.reviewID))),
  controller.deleteReview
);

export default router;

