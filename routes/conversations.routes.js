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

// List user's conversations
router.get(
  '/',
  authRequired(),
  // Only the user specified in the API endpoint (by userID) can see their conversations
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  controller.listConversations
);

// Get conversation
router.get(
  '/:conversationID',
  authRequired(),
  // Only members of the conversation can see it
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getConversation
);

// Add conversation to user's account
router.post(
  '/',
  authRequired(),
  // Only the user specified in the API endpoint (by userID) can add a conversation to their account
  authorizeOwner(async (req) => userServiceGet(Number(req.params.userID))),
  validate({ body: conversationBodySchema }),
  controller.createConversation
);

// Update conversation
router.put(
  '/:conversationID',
  authRequired(),
  // Only the owner of the conversation can update it
  authorizeOwner(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: conversationBodySchema }),
  controller.updateConversation
);

// Delete conversation
router.delete(
  '/:conversationID',
  authRequired(),
  // Only the owner of the conversation can delete it
  authorizeOwner(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.deleteConversation
);

// Messages

// List messages in a conversation
router.get(
  '/:conversationID/messages',
  authRequired(),
  // Only members of the conversation can see its messages
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.listMessages
);

// Get message in a conversation
router.get(
  '/:conversationID/messages/:messageID',
  authRequired(),
  // Only members of the conversation can get a specific message within it
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  controller.getMessage
);

// Create message in a conversation
router.post(
  '/:conversationID/messages',
  authRequired(),
  // Only members of the conversation can send a message in it
  authorizeMember(async (req) => convServiceGet(Number(req.params.userID), Number(req.params.conversationID))),
  validate({ body: messageBodySchema }),
  controller.createMessage
);

// Update message in a conversation
router.put(
  '/:conversationID/messages/:messageID',
  authRequired(),
  // Only the sender of the message can edit it
  authorizeOwner(async (req) => convServiceGetMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  validate({ body: messageBodySchema }),
  controller.updateMessage
);

// Delete message in a conversation
router.delete(
  '/:conversationID/messages/:messageID',
  authRequired(),
  // Only the sender of the message can delete it
  authorizeOwner(async (req) => convServiceGetMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID))),
  controller.deleteMessage
);

export default router;

