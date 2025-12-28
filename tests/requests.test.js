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
const charlieRequestId = 2; // seeded in mock data

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
  Tests for endpoints under /requests
  Includes tests for all CRUD operations and covers both success and failure cases, e.g.
  invalid input parameters (path and body), non-existent resources, lack of authentication or authorization,
  admin overrides, etc.
*/

// ---------------
// Success cases |
// ---------------

test.serial('List requests (GET /requests)', async (t) => {
  const res = await client.get('requests');
  t.is(res.statusCode, 200);
  t.true(Array.isArray(res.body.data));
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

let createdRequestId;

test.serial('Create request (POST /requests)', async (t) => {
  const payload = {
    Start: 'City A',
    End: 'City B',
    DateAndTime: Math.floor(Date.now() / 1000) + 86400,
    Description: 'Need ride tomorrow'
  };
  const res = await authClient.post('requests', { json: payload });
  createdRequestId = res.body.data.RequestID;
  t.truthy(createdRequestId);

  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Get request by ID (GET /requests/:requestID)', async (t) => {
  const res = await client.get(`requests/${createdRequestId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.RequestID, createdRequestId);
});

test.serial('Update request (PUT /requests/:requestID)', async (t) => {
  const res = await authClient.put(`requests/${createdRequestId}`, {
    json: {
      Start: 'City A',
      End: 'City C',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Updated route needed'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.End, 'City C');
});

// -----------------------
// Various failure cases |
// -----------------------

// --------------
// Get failures |
// --------------

test.serial('Get non-existent request (GET /requests/:requestID)', async (t) => {
  const res = await client.get('requests/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// -----------------
// Create failures |
// -----------------

test.serial('Create request (POST /requests) with invalid credentials', async (t) => {
  const payload = {
    Start: 'City A',
    End: 'City B',
    DateAndTime: Math.floor(Date.now() / 1000) + 86400,
    Description: 'Need ride tomorrow'
  };
  const res = await client.post('requests', { json: payload });
	t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Create request (POST /requests) with invalid body', async (t) => {
  const payload = {
    // Missing Start
    End: 'City B',
    DateAndTime: Math.floor(Date.now() / 1000) + 86400,
    Description: 'Need ride tomorrow'
  };
  const res = await authClient.post('requests', { json: payload });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

// -----------------
// Update failures |
// -----------------

test.serial('Update non-existent request (PUT /requests/:requestID)', async (t) => {
  const res = await authClient.put('requests/676767', {
    json: {
      Start: 'City A',
      End: 'City C',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Updated route needed'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update request (PUT /requests/:requestID) with invalid body', async (t) => {
  const res = await authClient.put(`requests/${createdRequestId}`, {
    json: {
      // Missing Start
      End: 'City C',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Updated route with invalid body needed'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update request (PUT /requests/:requestID) with invalid credentials', async (t) => {
  const res = await client.put(`requests/${createdRequestId}`, {
    json: {
      Start: 'City A',
      End: 'City C',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Updated route with invalid credentials needed'
    }
  });
	t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Update request (PUT /requests/:requestID) with invalid authorization', async (t) => {
  const res = await authClient.put(`requests/${charlieRequestId}`, {
    json: {
      Start: 'City A',
      End: 'City C',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Updated route with invalid authorization needed'
    }
  });
	t.is(res.statusCode, 403);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

// -----------------
// Delete failures |
// -----------------

test.serial('Delete request (DELETE /requests/:requestID) with invalid credentials', async (t) => {
  const res = await client.delete(`requests/${createdRequestId}`);
	t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Delete request (DELETE /requests/:requestID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`requests/${charlieRequestId}`);
	t.is(res.statusCode, 403);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Delete non-existent request (DELETE /requests/:requestID)', async (t) => {
  const res = await authClient.delete('requests/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// ---------------------
// Successful deletion |
// ---------------------

test.serial('Delete request (DELETE /requests/:requestID)', async (t) => {
  const res = await authClient.delete(`requests/${createdRequestId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
	t.truthy(res.statusMessage);
});

// -----------------
// Admin overrides |
// -----------------

test.serial('Update request (PUT /requests/:requestID) via admin override', async (t) => {
  const res = await adminClient.put(`requests/${charlieRequestId}`, {
    json: {
      Start: 'City H',
      End: 'City W',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      Description: 'Trolololol'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.End, 'City W');
});

test.serial('Delete request (DELETE /requests/:requestID) via admin override', async (t) => {
  const res = await adminClient.delete(`requests/${charlieRequestId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
	t.truthy(res.statusMessage);
});

