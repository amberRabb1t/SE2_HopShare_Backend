import { sendSuccess } from '../utils/responses.js';
import { AppError, ERROR_CODES } from '../config/constants.js';
import * as convos from '../services/conversationService.js';

/**
 * List conversations
 */
export async function listConversations(req, res, next) {
  try {
    const list = await convos.list(Number(req.params.userID));
    return sendSuccess(res, list, "User's conversation list retrieved successfully", 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create conversation
 */
export async function createConversation(req, res, next) {
  try {
    const created = await convos.create(Number(req.params.userID), req.body);
    return sendSuccess(res, created, 'Conversation created successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get conversation
 */
export async function getConversation(req, res, next) {
  try {
    const item = await convos.get(Number(req.params.userID), Number(req.params.conversationID));
    if (!item) throw new AppError('Conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, item, 'Conversation details', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update conversation
 */
export async function updateConversation(req, res, next) {
  try {
    const updated = await convos.update(Number(req.params.userID), Number(req.params.conversationID), req.body);
    if (!updated) throw new AppError('Conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Conversation updated successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete conversation
 */
export async function deleteConversation(req, res, next) {
  try {
    const ok = await convos.remove(Number(req.params.userID), Number(req.params.conversationID));
    if (!ok) throw new AppError('Conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    // 204 should have empty body per spec but keeping response shape
    return sendSuccess(res, null, 'Conversation deleted successfully', 204);
  } catch (err) {
    return next(err);
  }
}

/**
 * List messages
 */
export async function listMessages(req, res, next) {
  try {
    const data = await convos.listMessages(Number(req.params.userID), Number(req.params.conversationID));
    return sendSuccess(res, data, 'List of messages retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Create message
 */
export async function createMessage(req, res, next) {
  try {
    const created = await convos.createMessage(Number(req.params.userID), Number(req.params.conversationID), req.body);
    return sendSuccess(res, created, 'Message created successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Get message
 */
export async function getMessage(req, res, next) {
  try {
    const item = await convos.getMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID));
    if (!item) throw new AppError('Message, conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, item, 'Message retrieved successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Update message
 */
export async function updateMessage(req, res, next) {
  try {
    const updated = await convos.updateMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID), req.body);
    if (!updated) throw new AppError('Message, conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, updated, 'Message updated successfully', 200);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete message
 */
export async function deleteMessage(req, res, next) {
  try {
    const ok = await convos.removeMessage(Number(req.params.userID), Number(req.params.conversationID), Number(req.params.messageID));
    if (!ok) throw new AppError('Message, conversation or user not found', 404, ERROR_CODES.NOT_FOUND);
    return sendSuccess(res, null, 'Message deleted successfully', 204);
  } catch (err) {
    return next(err);
  }
}