import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;
let authClient;
let charlieClient;
let adminClient;

const bobAuth = { email: 'bob@example.com', password: 'password123' };
const charlieAuth = { email: 'charlie@example.com', password: 'password123' };
const aliceAuth = { email: 'alice@example.com', password: 'password123' };

// seeded in mock service
const bobId = 2;
const bobConversationId = 2;

const charlieId = 3;
const charlieMessageId = 4;
const charlieConversationId = 3;

const aliceId = 1;
const aliceMessageId = 3;
const aliceOwnConvoMessageId = 1;
const aliceConversationId = 1;

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, bobAuth);
  charlieClient = makeClient(serverCtx.url, charlieAuth);
  adminClient = makeClient(serverCtx.url, aliceAuth);
});

test.after.always(async () => {
  await serverCtx.close();
});

let createdMessageId;

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages)', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations/${bobConversationId}/messages`, {
    json: {
      MessageText: 'Test message'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.MessageID);
  createdMessageId = res.body.data.MessageID;
});

test.serial('List messages (GET /users/:userID/conversations/:conversationID/messages)', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/${bobConversationId}/messages`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get message by ID (GET /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.MessageID, createdMessageId);
});

test.serial('List messages (GET /users/:userID/conversations/:conversationID/messages) of non-existent user', async (t) => {
  const res = await authClient.get(`users/676767/conversations/${bobConversationId}/messages`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('List messages (GET /users/:userID/conversations/:conversationID/messages) of non-existent conversation', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/676767/messages`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get non-existent message (GET /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/${bobConversationId}/messages/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Get message (GET /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent conversation', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/676767/messages/${createdMessageId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Get message (GET /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent user', async (t) => {
  const res = await authClient.get(`users/676767/conversations/${bobConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`, {
    json: {
      MessageText: 'Edited message text'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`, {
    json: {
      MessageText: 'More message text'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with invalid authorization', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${bobConversationId}/messages/${aliceMessageId}`, {
    json: {
      MessageText: 'More message text'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`users/${bobId}/conversations/${bobConversationId}/messages/${aliceMessageId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/conversations/${bobConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with invalid body', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations/${bobConversationId}/messages`, {
    json: {
      // Missing MessageText
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with invalid credentials', async (t) => {
  const res = await client.post(`users/${bobId}/conversations/${bobConversationId}/messages`, {
    json: {
      MessageText: 'One more test message'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with invalid authorization', async (t) => {
  const res = await charlieClient.post(`users/${aliceId}/conversations/${aliceConversationId}/messages`, {
    json: {
      MessageText: 'One more test message'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) in conversation of non-existent user', async (t) => {
  const res = await authClient.post(`users/676767/conversations/${bobConversationId}/messages`, {
    json: {
      MessageText: 'One more test message'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) in non-existent conversation', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations/676767/messages`, {
    json: {
      MessageText: 'One more test message'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent message (PUT /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${bobConversationId}/messages/676767`, {
    json: {
      MessageText: 'Non-existent message'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/conversations/${bobConversationId}/messages/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent conversation', async (t) => {
  const res = await adminClient.put(`users/${aliceId}/conversations/676767/messages/${aliceOwnConvoMessageId}`, {
    json: {
      MessageText: 'Non-existent message'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent conversation', async (t) => {
  const res = await adminClient.delete(`users/${aliceId}/conversations/676767/messages/${aliceOwnConvoMessageId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent user', async (t) => {
  const res = await adminClient.put(`users/676767/conversations/${aliceConversationId}/messages/${aliceOwnConvoMessageId}`, {
    json: {
      MessageText: 'Non-existent message'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) of non-existent user', async (t) => {
  const res = await adminClient.delete(`users/676767/conversations/${aliceConversationId}/messages/${aliceOwnConvoMessageId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with membership instead of ownership', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations/${aliceConversationId}/messages`, {
    json: {
      MessageText: 'Test message'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.MessageID);
  createdMessageId = res.body.data.MessageID;
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with membership instead of ownership', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${aliceConversationId}/messages/${createdMessageId}`, {
    json: {
      MessageText: 'Edited message text'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('List messages (GET /users/:userID/conversations/:conversationID/messages) with membership instead of ownership', async (t) => {
  const res = await authClient.get(`users/${aliceId}/conversations/${aliceConversationId}/messages`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get message by ID (GET /users/:userID/conversations/:conversationID/messages/:messageID) with membership instead of ownership', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/${aliceConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.MessageID, createdMessageId);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) with membership instead of ownership', async (t) => {
  const res = await authClient.delete(`users/${bobId}/conversations/${aliceConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

// Admin overrides

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) via admin override', async (t) => {
  const res = await adminClient.post(`users/${charlieId}/conversations/${charlieConversationId}/messages`, {
    json: {
      MessageText: 'Test message'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.MessageID);
});

test.serial('List messages (GET /users/:userID/conversations/:conversationID/messages) via admin override', async (t) => {
  const res = await adminClient.get(`users/${charlieId}/conversations/${charlieConversationId}/messages`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get message by ID (GET /users/:userID/conversations/:conversationID/messages/:messageID) via admin override', async (t) => {
  const res = await adminClient.get(`users/${charlieId}/conversations/${charlieConversationId}/messages/${charlieMessageId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.MessageID, charlieMessageId);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) via admin override', async (t) => {
  const res = await adminClient.put(`users/${charlieId}/conversations/${charlieConversationId}/messages/${charlieMessageId}`, {
    json: {
      MessageText: 'Edited message text'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) via admin override', async (t) => {
  const res = await adminClient.delete(`users/${charlieId}/conversations/${charlieConversationId}/messages/${charlieMessageId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

