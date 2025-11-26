import { dbState } from '../config/database.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { getNextId } from '../utils/helpers.js';

const conversations = [
  { ConversationID: 1, ConversationName: 'Trip to City B', Timestamp: 1731400700, userID: 1 },
  { ConversationID: 2, ConversationName: 'Airport Group', Timestamp: 1731400800, userID: 2 }
];

const messages = [
  { MessageID: 1, MessageText: 'Hello team', Timestamp: 1731400850, userID: 1, conversationID: 1 },
  { MessageID: 2, MessageText: 'When do we leave?', Timestamp: 1731400900, userID: 2, conversationID: 1 },
  { MessageID: 3, MessageText: 'See you at 8 AM', Timestamp: 1731400950, userID: 1, conversationID: 2 }
];

export async function list(userID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return conversations.filter(c => c.userID === Number(userID));
  }
  return Conversation.find({ userID: Number(userID) });
}

export async function create(userID, payload) {
  const { useMockData } = dbState();
  const toCreate = { ...payload, userID: Number(userID), Timestamp: payload.Timestamp || Math.floor(Date.now() / 1000) };
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

export async function get(userID, conversationID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return conversations.find(c => c.userID === Number(userID) && c.ConversationID === Number(conversationID)) || null;
  }
  return Conversation.findOne({ userID: Number(userID), ConversationID: Number(conversationID) });
}

export async function update(userID, conversationID, payload) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = conversations.findIndex(c => c.userID === Number(userID) && c.ConversationID === Number(conversationID));
    if (idx === -1) return null;
    conversations[idx] = { ...conversations[idx], ...payload };
    return conversations[idx];
  }
  return Conversation.findOneAndUpdate({ userID: Number(userID), ConversationID: Number(conversationID) }, payload, { new: true });
}

export async function remove(userID, conversationID) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = conversations.findIndex(c => c.userID === Number(userID) && c.ConversationID === Number(conversationID));
    if (idx === -1) return false;
    conversations.splice(idx, 1);
    return true;
  }
  const res = await Conversation.deleteOne({ userID: Number(userID), ConversationID: Number(conversationID) });
  return res.deletedCount > 0;
}

// Messages

export async function listMessages(userID, conversationID) {
  const { useMockData } = dbState();
  if (useMockData) {
    // Note: path includes userID; we don't verify membership in mock.
    return messages.filter(m => m.conversationID === Number(conversationID));
  }
  return Message.find({ conversationID: Number(conversationID) });
}

export async function createMessage(userID, conversationID, payload) {
  const { useMockData } = dbState();
  const toCreate = {
    ...payload,
    userID: Number(userID),
    conversationID: Number(conversationID),
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

export async function getMessage(userID, conversationID, messageID) {
  const { useMockData } = dbState();
  if (useMockData) {
    return messages.find(m => m.conversationID === Number(conversationID) && m.MessageID === Number(messageID)) || null;
  }
  return Message.findOne({ conversationID: Number(conversationID), MessageID: Number(messageID) });
}

export async function updateMessage(userID, conversationID, messageID, payload) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = messages.findIndex(m => m.conversationID === Number(conversationID) && m.MessageID === Number(messageID));
    if (idx === -1) return null;
    messages[idx] = { ...messages[idx], ...payload };
    return messages[idx];
  }
  return Message.findOneAndUpdate({ conversationID: Number(conversationID), MessageID: Number(messageID) }, payload, { new: true });
}

export async function removeMessage(userID, conversationID, messageID) {
  const { useMockData } = dbState();
  if (useMockData) {
    const idx = messages.findIndex(m => m.conversationID === Number(conversationID) && m.MessageID === Number(messageID));
    if (idx === -1) return false;
    messages.splice(idx, 1);
    return true;
  }
  const res = await Message.deleteOne({ conversationID: Number(conversationID), MessageID: Number(messageID) });
  return res.deletedCount > 0;
}

// Expose mocks for cross-service references (read-only)
export function __mock() {
  return { conversations, messages };
}