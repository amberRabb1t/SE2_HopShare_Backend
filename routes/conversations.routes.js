import { Router } from 'express';
import { validate } from '../middleware/validation.js';
import { authRequired } from '../middleware/auth.js';
import { conversationBodySchema, messageBodySchema } from '../utils/validators.js';
import * as controller from '../controllers/conversationController.js';

const router = Router({ mergeParams: true });

// Conversations
router.get('/', controller.listConversations);
router.post('/', authRequired(), validate({ body: conversationBodySchema }), controller.createConversation);

router.get('/:conversationID', controller.getConversation);
router.put('/:conversationID', authRequired(), validate({ body: conversationBodySchema }), controller.updateConversation);
router.delete('/:conversationID', authRequired(), controller.deleteConversation);

// Messages nested
router.get('/:conversationID/messages', controller.listMessages);
router.post('/:conversationID/messages', authRequired(), validate({ body: messageBodySchema }), controller.createMessage);

router.get('/:conversationID/messages/:messageID', controller.getMessage);
router.put('/:conversationID/messages/:messageID', authRequired(), validate({ body: messageBodySchema }), controller.updateMessage);
router.delete('/:conversationID/messages/:messageID', authRequired(), controller.deleteMessage);

export default router;