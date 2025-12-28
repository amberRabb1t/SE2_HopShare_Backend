import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client; // anonymous guest
let authClient; // authenticated user
let charlieClient;  // another authenticated user (useful for not-owner/not-member testing)
let adminClient;  // admin account

// Credentials needed to make the clients; these users are seeded in the mock data
const bobAuth = { email: 'bob@example.com', password: 'password123' };
const charlieAuth = { email: 'charlie@example.com', password: 'password123' };
const aliceAuth = { email: 'alice@example.com', password: 'password123' };

// seeded in mock data
const aliceId = 1;
const aliceCarId = 1;
const bobId = 2;

// Setup
test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, bobAuth);
  charlieClient = makeClient(serverCtx.url, charlieAuth);
  adminClient = makeClient(serverCtx.url, aliceAuth);
});

// Teardown
test.after.always(async () => {
  await serverCtx.close();
});

/*
  Tests for endpoints under /users/:userID/cars
  Includes tests for all CRUD operations and covers both success and failure cases, e.g.
  invalid input parameters (path and body), non-existent resources, lack of authentication or authorization,
  admin overrides, etc.
*/

// ---------------
// Success cases |
// ---------------

let createdCarId;

test.serial('Create car (POST /users/:userID/cars)', async (t) => {
  const res = await authClient.post(`users/${bobId}/cars`, {
    json: {
      Seats: 4,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  createdCarId = res.body.data.CarID;
});

test.serial('List cars (GET /users/:userID/cars)', async (t) => {
  const res = await client.get(`users/${bobId}/cars`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get car by ID (GET /users/:userID/cars/:carID)', async (t) => {
  const res = await client.get(`users/${bobId}/cars/${createdCarId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.CarID, createdCarId);
});

test.serial('Update car (PUT /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/cars/${createdCarId}`, {
    json: {
      Seats: 5,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.Seats, 5);
});

// -----------------------
// Various failure cases |
// -----------------------

// --------------
// Get failures |
// --------------

test.serial('Get car (GET /users/:userID/cars/:carID) of non-existent user', async (t) => {
  const res = await adminClient.get(`users/676767/cars/${aliceCarId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Get non-existent car (GET /users/:userID/cars/:carID)', async (t) => {
  const res = await client.get(`users/${bobId}/cars/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// -----------------
// Create failures |
// -----------------

test.serial('Create car (POST /users/:userID/cars) with invalid credentials', async (t) => {
  const res = await client.post(`users/${bobId}/cars`, {
    json: {
      Seats: 4,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create car (POST /users/:userID/cars) with invalid authorization', async (t) => {
  const res = await charlieClient.post(`users/${bobId}/cars`, {
    json: {
      Seats: 4,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create car (POST /users/:userID/cars) with invalid body', async (t) => {
  const res = await authClient.post(`users/${bobId}/cars`, {
    json: {
      // Missing Seats
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create car (POST /users/:userID/cars) connected to non-existent user', async (t) => {
  const res = await adminClient.post(`users/676767/cars`, {
    json: {
      // Missing Seats
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

// -----------------
// Update failures |
// -----------------

test.serial('Update car (PUT /users/:userID/cars/:carID) of non-existent user', async (t) => {
  const res = await adminClient.put(`users/676767/cars/${aliceCarId}`, {
    json: {
      Seats: 1,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update non-existent car (PUT /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/cars/676767`, {
    json: {
      Seats: 5,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update car (PUT /users/:userID/cars/:carID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${bobId}/cars/${createdCarId}`, {
    json: {
      // Missing Seats
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update car (PUT /users/:userID/cars/:carID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${bobId}/cars/${createdCarId}`, {
    json: {
      Seats: 5,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update car (PUT /users/:userID/cars/:carID) with invalid authorization', async (t) => {
  const res = await authClient.put(`users/${aliceId}/cars/${aliceCarId}`, {
    json: {
      Seats: 5,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

// -----------------
// Delete failures |
// -----------------

test.serial('Delete car (DELETE /users/:userID/cars/:carID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${bobId}/cars/${createdCarId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete car (DELETE /users/:userID/cars/:carID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/cars/${aliceCarId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete non-existent car (DELETE /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/cars/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete car (DELETE /users/:userID/cars/:carID) of non-existent user', async (t) => {
  const res = await adminClient.delete(`users/676767/cars/${aliceCarId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// ---------------------
// Successful deletion |
// ---------------------

test.serial('Delete car (DELETE /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/cars/${createdCarId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

// -----------------
// Admin overrides |
// -----------------

test.serial('Create car (POST /users/:userID/cars) via admin override', async (t) => {
  const res = await adminClient.post(`users/${bobId}/cars`, {
    json: {
      Seats: 4,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  createdCarId = res.body.data.CarID;
});

test.serial('Update car (PUT /users/:userID/cars/:carID) via admin override', async (t) => {
  const res = await adminClient.put(`users/${bobId}/cars/${createdCarId}`, {
    json: {
      Seats: 5,
      ServiceDate: Math.floor(Date.now() / 1000),
      MakeModel: 'Tesla Model 3',
      LicensePlate: 'TEST-123'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.Seats, 5);
});

test.serial('Delete car (DELETE /users/:userID/cars/:carID) via admin override', async (t) => {
  const res = await adminClient.delete(`users/${bobId}/cars/${createdCarId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

