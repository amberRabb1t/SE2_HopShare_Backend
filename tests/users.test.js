import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client; // anonymous guest
let authClient; // authenticated user
let adminClient;  // admin account

// Credentials needed to make the clients; these users are seeded in the mock data
const bobAuth = { email: 'bob@example.com', password: 'password123' };
const aliceAuth = { email: 'alice@example.com', password: 'password123' };
const bobId = 2; // seeded in mock data

// Setup
test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, bobAuth);
  adminClient = makeClient(serverCtx.url, aliceAuth);
});

// Teardown
test.after.always(async () => {
  await serverCtx.close();
});

/*
  Tests for endpoints under /users (only up to /users/:userID)
  Includes tests for all CRUD operations and covers both success and failure cases, e.g.
  invalid input parameters (path and body), non-existent resources, lack of authentication or authorization,
  admin overrides, etc.
*/

test.serial('List users (GET /users)', async (t) => {
  const res = await client.get('users');
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get user by ID (GET /users/:userID)', async (t) => {
  const res = await client.get(`users/${bobId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.UserID, bobId);
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
  const res = await authClient.put(`users/${bobId}`, {
    json: {
      Name: 'Bob',
      PhoneNumber: 6767676767,
      Email: 'bob@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${bobId}`, {
    json: {
      // Missing Name
      PhoneNumber: 7676767676,
      Email: 'bob@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with password that is too short', async (t) => {
  const res = await authClient.put(`users/${bobId}`, {
    json: {
      Name: 'BadPasswordGuy',
      PhoneNumber: 7676767676,
      Email: 'shouldbettermypasswords@example.com',
      Password: 'short'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${bobId}`, {
    json: {
      Name: 'Bob',
      PhoneNumber: 7676767676,
      Email: 'bob@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update user (PUT /users/:userID) with invalid authorization', async (t) => {
  const res = await authClient.put(`users/${createdUserId}`, {
    json: {
      Name: 'Bob',
      PhoneNumber: 7676767676,
      Email: 'bob@example.com',
      Password: 'password123'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete user (DELETE /users/:userID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${createdUserId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete user (DELETE /users/:userID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`users/${createdUserId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
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

test.serial('Create user (POST /users) with password that is too short', async (t) => {
  const res = await client.post('users', {
    json: {
      Name: 'BadPasswordEpidemicVictimNo2000',
      PhoneNumber: 5550001111,
      Email: 'ohnoes@example.com',
      Password: 'those'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent user (PUT /users/:userID)', async (t) => {
  const res = await authClient.put('users/676767', {
    json: {
      Name: 'Bob',
      PhoneNumber: 7676767676,
      Email: 'bob@example.com',
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

test.serial('Delete user (DELETE /users/:userID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

// Admin overrides

test.serial('Update user (PUT /users/:userID) via admin override', async (t) => {
  const res = await adminClient.put(`users/${createdUserId}`, {
    json: {
      Name: 'trole',
      PhoneNumber: 6767676767,
      Email: 'trole@example.com',
      Password: 'trolepass123'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Delete user (DELETE /users/:userID) via admin override', async (t) => {
  const res = await adminClient.delete(`users/${createdUserId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

