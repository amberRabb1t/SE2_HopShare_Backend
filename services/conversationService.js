import { dbState } from '../config/database.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { getNextId } from '../utils/helpers.js';

// Mock data used for testing without a database
const conversations = [
  { ConversationID: 1, ConversationName: 'Trip to City B', Timestamp: 1731400700, Members: [2, 4], UserID: 1 },
  { ConversationID: 2, ConversationName: 'Airport Group', Timestamp: 1731400800, Members: [1, 3], UserID: 2 },
  { ConversationID: 3, ConversationName: 'The Charlies', Timestamp: 1731400900, Members: [4], UserID: 3 }
];

const messages = [
  { MessageID: 1, MessageText: 'Hello team', Timestamp: 1731400850, ConversationID: 1, UserID: 1 },
  { MessageID: 2, MessageText: 'When do we leave?', Timestamp: 1731400900, ConversationID: 1, UserID: 2 },
  { MessageID: 3, MessageText: 'See you at 8 AM', Timestamp: 1731400950, ConversationID: 2, UserID: 1 },
  { MessageID: 4, MessageText: 'Don\'t forget the snacks', Timestamp: 1731401000, ConversationID: 3, UserID: 3 }
];

// Conversations

/**
 * List user's conversations
 * @param {number} userID 
 * @returns {array}
 */
export async function list(userID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return conversations.filter(c => c.UserID === Number(userID) || c.Members.includes(Number(userID)));
  }
  return Conversation.find({ UserID: Number(userID) });
}

/**
 * Create conversation in user's account
 * @param {number} userID 
 * @param {object} payload 
 * @returns {object}
 */
export async function create(userID, payload) {
  const { useMockData } = dbState();
  
  const toCreate = { ...payload, UserID: Number(userID), Members: payload.Members || [], Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
  if (useMockData) {
    toCreate.ConversationID = toCreate.ConversationID || getNextId(conversations, 'ConversationID');
    conversations.push(toCreate);
    return toCreate;
  }
  if (!toCreate.ConversationID) {
    const last = await Conversation.findOne().sort('-ConversationID').select('ConversationID');
    toCreate.ConversationID = last ? last.ConversationID + 1 : 1;
  }
  return Conversation.create(toCreate);
}

/**
 * Get user's conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @returns {object|null}
 */
export async function get(userID, conversationID) {
  const { useMockData } = dbState();

  if (useMockData) {
    return conversations.find(c => (c.UserID === Number(userID) || c.Members.includes(Number(userID))) && c.ConversationID === Number(conversationID)) || null;
  }
  return Conversation.findOne({ UserID: Number(userID), ConversationID: Number(conversationID) });
}

/**
 * Update user's conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @param {object} payload 
 * @returns {object|null}
 */
export async function update(userID, conversationID, payload) {
  const { useMockData } = dbState();

  const safe = { ...payload };
  delete safe.ConversationID;
  delete safe.Timestamp;
  
  if (useMockData) {
    const idx = conversations.findIndex(c => c.UserID === Number(userID) && c.ConversationID === Number(conversationID));
    if (idx === -1) return null;

    // The owner of the conversation should be able to make someone else the owner, but only if that someone else is a member of said conversation
    // Ownership is verified in authorizeOwner middleware
    if (!conversations[idx].Members.includes(Number(safe.UserID))) {
      delete safe.UserID;
    }

    conversations[idx] = { ...conversations[idx], ...safe };
    return conversations[idx];
  }
  return Conversation.findOneAndUpdate({ UserID: Number(userID), ConversationID: Number(conversationID) }, safe, { new: true });
}

/**
 * Delete user's conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @returns {boolean}
 */
export async function remove(userID, conversationID) {
  const { useMockData } = dbState();

  if (useMockData) {
    const idx = conversations.findIndex(c => c.UserID === Number(userID) && c.ConversationID === Number(conversationID));
    if (idx === -1) return false;
    conversations.splice(idx, 1);
    return true;
  }
  const res = await Conversation.deleteOne({ UserID: Number(userID), ConversationID: Number(conversationID) });
  return res.deletedCount > 0;
}

// Messages

/**
 * List messages in conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @returns {array|null}
 */
export async function listMessages(userID, conversationID) {
  const { useMockData } = dbState();

  const c = await get(userID, conversationID);
  if (!c) return null;

  if (useMockData) {
    return messages.filter(m => m.ConversationID === Number(conversationID) && (c.UserID === Number(userID) || c.Members.includes(Number(userID))));
  }
  return Message.find({ ConversationID: Number(conversationID) });
}

/**
 * Create message in conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @param {object} payload 
 * @returns {object|null}
 */
export async function createMessage(userID, conversationID, payload) {
  const { useMockData } = dbState();

  const c = await get(userID, conversationID);
  if (!c && !payload.adminOrigin) return null;

  const toCreate = {
    ...payload,
    UserID: Number(userID),
    ConversationID: Number(conversationID),
    Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000)
  };
  if (useMockData) {
    toCreate.MessageID = toCreate.MessageID || getNextId(messages, 'MessageID');
    messages.push(toCreate);
    return toCreate;
  }
  if (!toCreate.MessageID) {
    const last = await Message.findOne().sort('-MessageID').select('MessageID');
    toCreate.MessageID = last ? last.MessageID + 1 : 1;
  }
  return Message.create(toCreate);
}

/**
 * Get message in conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @param {number} messageID 
 * @returns {object|null}
 */
export async function getMessage(userID, conversationID, messageID) {
  const { useMockData } = dbState();

  const c = await get(userID, conversationID);
  if (!c) return null;

  if (useMockData) {
    return messages.find(m => m.ConversationID === Number(conversationID) && m.MessageID === Number(messageID)) || null;
  }
  return Message.findOne({ ConversationID: Number(conversationID), MessageID: Number(messageID) });
}

/**
 * Update message in conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @param {number} messageID 
 * @param {object} payload 
 * @returns {object|null}
 */
export async function updateMessage(userID, conversationID, messageID, payload) {
  const { useMockData } = dbState();

  const c = await get(userID, conversationID);
  if (!c) return null;

  // Prevent updating immutable fields
  const safe = { ...payload };
  delete safe.MessageID;
  delete safe.ConversationID;
  delete safe.UserID;
  delete safe.Timestamp;

  if (useMockData) {
    const idx = messages.findIndex(m => m.ConversationID === Number(conversationID) && m.MessageID === Number(messageID));
    if (idx === -1) return null;
    messages[idx] = { ...messages[idx], ...safe };
    return messages[idx];
  }
  return Message.findOneAndUpdate({ ConversationID: Number(conversationID), MessageID: Number(messageID) }, safe, { new: true });
}

/**
 * Remove message in conversation
 * @param {number} userID 
 * @param {number} conversationID 
 * @param {number} messageID 
 * @returns {boolean|null}
 */
export async function removeMessage(userID, conversationID, messageID) {
  const { useMockData } = dbState();

  const c = await get(userID, conversationID);
  if (!c) return null;
  
  if (useMockData) {
    const idx = messages.findIndex(m => m.ConversationID === Number(conversationID) && m.MessageID === Number(messageID));
    if (idx === -1) return false;
    messages.splice(idx, 1);
    return true;
  }
  const res = await Message.deleteOne({ ConversationID: Number(conversationID), MessageID: Number(messageID) });
  return res.deletedCount > 0;
}

