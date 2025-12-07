import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;
let authClient;

const auth = { email: 'alice@example.com', password: 'password123' };
const aliceId = 1; // seeded in mock service
const aliceConversationId = 1; // seeded in mock service

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, auth);
});

test.after.always(async () => {
  await serverCtx.close();
});

let createdMessageId;

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages)', async (t) => {
  const res = await authClient.post(`users/${aliceId}/conversations/${aliceConversationId}/messages`, {
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
  const res = await client.get(`users/${aliceId}/conversations/${aliceConversationId}/messages`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get message by ID (GET /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await client.get(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.MessageID, createdMessageId);
});

test.serial('Get non-existent message (GET /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await client.get(`users/${aliceId}/conversations/${aliceConversationId}/messages/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`, {
    json: {
      MessageText: 'Edited message text'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update message (PUT /users/:userID/conversations/:conversationID/messages/:messageID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`, {
    json: {
      MessageText: 'More message text'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete message (DELETE /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/conversations/${aliceConversationId}/messages/${createdMessageId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with invalid body', async (t) => {
  const res = await authClient.post(`users/${aliceId}/conversations/${aliceConversationId}/messages`, {
    json: {
      // Missing MessageText
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create message (POST /users/:userID/conversations/:conversationID/messages) with invalid credentials', async (t) => {
  const res = await client.post(`users/${aliceId}/conversations/${aliceConversationId}/messages`, {
    json: {
      MessageText: 'One more test message'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent message (PUT /users/:userID/conversations/:conversationID/messages/:messageID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${aliceConversationId}/messages/676767`, {
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
  const res = await authClient.delete(`users/${aliceId}/conversations/${aliceConversationId}/messages/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

