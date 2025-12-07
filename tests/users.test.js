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

test.serial('List users (GET /users)', async (t) => {
  const res = await client.get('users');
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get user by ID (GET /users/:userID)', async (t) => {
  const res = await client.get(`users/${aliceId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.UserID, aliceId);
});

test.serial('Get non-existent user (GET /users/:userID)', async (t) => {
  const res = await client.get('users/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

let createdUserId;

test.serial('Create user (POST /users)', async (t) => {
  const res = await client.post('users', {
    json: {
      Name: 'Diana',
      PhoneNumber: 5550001111,
      Email: 'diana@example.com',
      Password: 'newpass123'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.UserID);
  createdUserId = res.body.data.UserID;
});

test.serial('Update user (PUT /users/:userID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}`, {
    json: {
      Name: 'Alice',
      PhoneNumber: 6767676767,
      Email: 'alice@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${aliceId}`, {
    json: {
      // Missing Name
      PhoneNumber: 7676767676,
      Email: 'alice@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${aliceId}`, {
    json: {
      Name: 'Alice',
      PhoneNumber: 7676767676,
      Email: 'alice@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete user (DELETE /users/:userID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${createdUserId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete user (DELETE /users/:userID)', async (t) => {
  const res = await authClient.delete(`users/${createdUserId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create user (POST /users) with invalid body', async (t) => {
  const res = await client.post('users', {
    json: {
      // Missing Name
      PhoneNumber: 5550001111,
      Email: 'diana@example.com',
      Password: 'newpass123'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent user (PUT /users/:userID)', async (t) => {
  const res = await authClient.put('users/676767', {
    json: {
      Name: 'Alice',
      PhoneNumber: 7676767676,
      Email: 'alice@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent user (DELETE /users/:userID)', async (t) => {
  const res = await authClient.delete('users/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

