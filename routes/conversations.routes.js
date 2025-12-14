import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner, authorizeMember } from '../middleware/authorize.js';
import { conversationBodySchema, messageBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/conversationController.js';
import * as convService from '../services/conversationService.js';
import * as userService from '../services/userService.js';

const router = Router({ mergeParams: true });

// Conversations

router.get(
  '/',
  authRequired(),
  authorizeOwner(async (req) => userService.get(Number(req.params.userID))),
  controller.listConversations
);

router.get(
  '/:conversationID',
  authRequired(),
  authorizeMember(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getConversation
);

router.post(
  '/',
  authRequired(),
  authorizeOwner(async (req) => userService.get(Number(req.params.userID))),
  validate({ body: conversationBodySchema }),
  controller.createConversation
);

router.put(
  '/:conversationID',
  authRequired(),
  authorizeOwner(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: conversationBodySchema }),
  controller.updateConversation
);

router.delete(
  '/:conversationID',
  authRequired(),
  authorizeOwner(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  controller.deleteConversation
);

// Messages

router.get(
  '/:conversationID/messages',
  authRequired(),
  authorizeMember(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  controller.listMessages
);

router.get(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeMember(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getMessage
);

router.post(
  '/:conversationID/messages',
  authRequired(),
  authorizeMember(async (req) => convService.get(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: messageBodySchema }),
  controller.createMessage
);

router.put(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeOwner(async (req) => convService.getMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  validate({ body: messageBodySchema }),
  controller.updateMessage
);

router.delete(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeOwner(async (req) => convService.getMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  controller.deleteMessage
);

export default router;

