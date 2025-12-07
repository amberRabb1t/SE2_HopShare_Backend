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

let createdCarId;

test.serial('Create car (POST /users/:userID/cars)', async (t) => {
  const res = await authClient.post(`users/${aliceId}/cars`, {
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
  const res = await client.get(`users/${aliceId}/cars`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get car by ID (GET /users/:userID/cars/:carID)', async (t) => {
  const res = await client.get(`users/${aliceId}/cars/${createdCarId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.CarID, createdCarId);
});

test.serial('Get non-existent car (GET /users/:userID/cars/:carID)', async (t) => {
  const res = await client.get(`users/${aliceId}/cars/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update car (PUT /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/cars/${createdCarId}`, {
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

test.serial('Update car (PUT /users/:userID/cars/:carID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${aliceId}/cars/${createdCarId}`, {
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
  const res = await client.put(`users/${aliceId}/cars/${createdCarId}`, {
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

test.serial('Delete car (DELETE /users/:userID/cars/:carID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${aliceId}/cars/${createdCarId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete car (DELETE /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/cars/${createdCarId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create car (POST /users/:userID/cars) with invalid credentials', async (t) => {
  const res = await client.post(`users/${aliceId}/cars`, {
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

test.serial('Create car (POST /users/:userID/cars) with invalid body', async (t) => {
  const res = await authClient.post(`users/${aliceId}/cars`, {
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

test.serial('Update non-existent car (PUT /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/cars/676767`, {
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

test.serial('Delete non-existent car (DELETE /users/:userID/cars/:carID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/cars/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

