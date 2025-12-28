import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { authorizeOwner, authorizeMember } from '../middleware/authorize.js';
import { conversationBodySchema, messageBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/conversationController.js';
import { get as convServiceGet, getMessage as convServiceGetMessage } from '../services/conversationService.js';
import { get as userServiceGet } from '../services/userService.js';

const router = Router({ mergeParams: true });

// Conversations

// Only the user specified in the API endpoint (by userID) can see their conversations
router.get(
  '/',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  controller.listConversations
);

// Only members of the conversation can get its details
router.get(
  '/:conversationID',
  authRequired(),
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getConversation
);

// Only the user specified in the API endpoint (by userID) can add a conversation to their account
router.post(
  '/',
  authRequired(),
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: conversationBodySchema }),
  controller.createConversation
);

// Only the owner of the conversation can update it
router.put(
  '/:conversationID',
  authRequired(),
  authorizeOwner(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: conversationBodySchema }),
  controller.updateConversation
);

// Only the owner of the conversation can delete it
router.delete(
  '/:conversationID',
  authRequired(),
  authorizeOwner(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.deleteConversation
);

// Messages

// Only members of the conversation can see its messages
router.get(
  '/:conversationID/messages',
  authRequired(),
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.listMessages
);

// Only members of the conversation can get a specific message within it
router.get(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getMessage
);

// Only members of the conversation can send a message in it
router.post(
  '/:conversationID/messages',
  authRequired(),
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: messageBodySchema }),
  controller.createMessage
);

// Only the sender of the message can edit it
router.put(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeOwner(async (req) => convServiceGetMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  validate({ body: messageBodySchema }),
  controller.updateMessage
);

// Only the sender of the message can delete it
router.delete(
  '/:conversationID/messages/:messageID',
  authRequired(),
  authorizeOwner(async (req) => convServiceGetMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  controller.deleteMessage
);

export default router;

