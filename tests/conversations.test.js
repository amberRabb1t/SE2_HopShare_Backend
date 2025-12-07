import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;
let authClient;

const auth = { email: 'alice@example.com', password: 'password123' };
const aliceId = 1; // seeded in mock service

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, auth);
});

test.after.always(async () => {
  await serverCtx.close();
});


// Conversations

let createdConversationId;

test.serial('Create conversation (POST /users/:userID/conversations)', async (t) => {
  const res = await authClient.post(`users/${aliceId}/conversations`, {
    json: {
      ConversationName: 'Test convo'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.ConversationID);
  createdConversationId = res.body.data.ConversationID;
});

test.serial('List conversations (GET /users/:userID/conversations)', async (t) => {
  const res = await client.get(`users/${aliceId}/conversations`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await client.get(`users/${aliceId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ConversationID, createdConversationId);
});

test.serial('Get non-existent conversation (GET /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await client.get(`users/${aliceId}/conversations/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${createdConversationId}`, {
    json: {
      ConversationName: 'New convo name'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${createdConversationId}`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${aliceId}/conversations/${createdConversationId}`, {
    json: {
      ConversationName: 'Yet another convo name'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${aliceId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create conversation (POST /users/:userID/conversations) with invalid body', async (t) => {
  const res = await authClient.post(`users/${aliceId}/conversations`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create conversation (POST /users/:userID/conversations) with invalid credentials', async (t) => {
  const res = await client.post(`users/${aliceId}/conversations`, {
    json: {
      ConversationName: 'One more test convo'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent conversation (PUT /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/676767`, {
    json: {
      ConversationName: 'Non-existent convo'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent conversation (DELETE /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/conversations/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

