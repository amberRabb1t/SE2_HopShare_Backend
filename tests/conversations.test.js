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
const aliceId = 1;
const aliceConversationId = 1;
const bobId = 2;
const bobConversationId = 2;
const charlieId = 3;
const charlieConversationId = 3;

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

let createdConversationId;

test.serial('Create conversation (POST /users/:userID/conversations)', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations`, {
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
  const res = await authClient.get(`users/${bobId}/conversations`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ConversationID, createdConversationId);
});

test.serial('Get non-existent conversation (GET /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.get(`users/${bobId}/conversations/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${createdConversationId}`, {
    json: {
      ConversationName: 'New convo name'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/${createdConversationId}`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${bobId}/conversations/${createdConversationId}`, {
    json: {
      ConversationName: 'Yet another convo name'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) with invalid authorization', async (t) => {
  const res = await authClient.put(`users/${aliceId}/conversations/${aliceConversationId}`, {
    json: {
      ConversationName: 'Yet another convo name'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${bobId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/conversations/${aliceConversationId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('List conversations (GET /users/:userID/conversations) with invalid credentials', async (t) => {
  const res = await client.get(`users/${bobId}/conversations`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('List conversations (GET /users/:userID/conversations) with invalid authorization', async (t) => {
  const res = await authClient.get(`users/${aliceId}/conversations`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID) with invalid credentials', async (t) => {
  const res = await client.get(`users/${bobId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID) with invalid authorization', async (t) => {
  const res = await charlieClient.get(`users/${aliceId}/conversations/${aliceConversationId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID) via membership instead of ownership', async (t) => {
  const res = await authClient.get(`users/${aliceId}/conversations/${aliceConversationId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID) of non-existent user', async (t) => {
  const res = await adminClient.get(`users/676767/conversations/${aliceConversationId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Create conversation (POST /users/:userID/conversations) with invalid body', async (t) => {
  const res = await authClient.post(`users/${bobId}/conversations`, {
    json: {
      // Missing Name
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create conversation (POST /users/:userID/conversations) with invalid credentials', async (t) => {
  const res = await client.post(`users/${bobId}/conversations`, {
    json: {
      ConversationName: 'One more test convo'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create conversation (POST /users/:userID/conversations) with invalid authorization', async (t) => {
  const res = await authClient.post(`users/${aliceId}/conversations`, {
    json: {
      ConversationName: 'One more test convo'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create conversation (POST /users/:userID/conversations) connected to non-existent user', async (t) => {
  const res = await adminClient.post(`users/676767/conversations`, {
    json: {
      ConversationName: 'One more test convo'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent conversation (PUT /users/:userID/conversations/:conversationID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/conversations/676767`, {
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
  const res = await authClient.delete(`users/${bobId}/conversations/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) of non-existent user', async (t) => {
  const res = await adminClient.put(`users/676767/conversations/${aliceConversationId}`, {
    json: {
      ConversationName: 'convo of non-existent user'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID) of non-existent user', async (t) => {
  const res = await adminClient.delete(`users/676767/conversations/${aliceConversationId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// Admin overrides

test.serial('List conversations (GET /users/:userID/conversations) via admin override', async (t) => {
  const res = await adminClient.get(`users/${bobId}/conversations`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get conversation by ID (GET /users/:userID/conversations/:conversationID) via admin override', async (t) => {
  const res = await adminClient.get(`users/${charlieId}/conversations/${charlieConversationId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ConversationID, charlieConversationId);
});

test.serial('Create conversation (POST /users/:userID/conversations) via admin override', async (t) => {
  const res = await adminClient.post(`users/${bobId}/conversations`, {
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

test.serial('Update conversation (PUT /users/:userID/conversations/:conversationID) via admin override', async (t) => {
  const res = await adminClient.put(`users/${bobId}/conversations/${createdConversationId}`, {
    json: {
      ConversationName: 'New convo name'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Delete conversation (DELETE /users/:userID/conversations/:conversationID) via admin override', async (t) => {
  const res = await adminClient.delete(`users/${bobId}/conversations/${createdConversationId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

