import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;
let authClient;

const auth = { email: 'alice@example.com', password: 'password123' };

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, auth);
});

test.after.always(async () => {
  await serverCtx.close();
});

test.serial('List routes (GET /routes)', async (t) => {
  const res = await client.get('routes');
  t.is(res.statusCode, 200);
  t.true(Array.isArray(res.body.data));
  t.is(res.body.success, true);
	t.truthy(res.body.message);
});

let createdRouteId;

test.serial('Create route (POST /routes)', async (t) => {
  const payload = {
    Start: 'City X',
    End: 'City Y',
    Stops: 'Midpoint',
    DateAndTime: Math.floor(Date.now() / 1000) + 86400,
    OccupiedSeats: 1,
    Comment: 'Test route'
  };
  const res = await authClient.post('routes', { json: payload });
  createdRouteId = res.body.data.RouteID;
  t.truthy(createdRouteId);

  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
	t.truthy(res.body.message);
  t.truthy(res.body.data);
});

test.serial('Get route by ID (GET /routes/:routeID)', async (t) => {
  const res = await client.get(`routes/${createdRouteId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
	t.truthy(res.body.message);
  t.is(res.body.data.RouteID, createdRouteId);
});

test.serial('Get non-existent route (GET /routes/:routeID)', async (t) => {
  const res = await client.get('routes/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update route (PUT /routes/:routeID)', async (t) => {
  const res = await authClient.put(`routes/${createdRouteId}`, {
    json: {
      Start: 'City X',
      End: 'City Y',
      Stops: 'Midpoint',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      OccupiedSeats: 2,
      Comment: 'Updated'
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
	t.truthy(res.body.message);
  t.is(res.body.data.OccupiedSeats, 2);
});

test.serial('Update route (PUT /routes/:routeID) with invalid body', async (t) => {
  const res = await authClient.put(`routes/${createdRouteId}`, {
    json: {
      // Missing Start
      End: 'City Y',
      Stops: 'Midpoint',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      OccupiedSeats: 2,
      Comment: 'Updated with invalid body'
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Update route (PUT /routes/:routeID) with invalid credentials', async (t) => {
  const res = await client.put(`routes/${createdRouteId}`, {
    json: {
      Start: 'City X',
      End: 'City Y',
      Stops: 'Midpoint',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      OccupiedSeats: 2,
      Comment: 'Updated with invalid credentials'
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Delete route (DELETE /routes/:routeID) with invalid credentials', async (t) => {
  const res = await client.delete(`routes/${createdRouteId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Delete route (DELETE /routes/:routeID)', async (t) => {
  const res = await authClient.delete(`routes/${createdRouteId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
	t.truthy(res.statusMessage);
});

test.serial('Create route (POST /routes) with invalid body', async (t) => {
  const res = await authClient.post('routes', {
    json: {
      // missing Start
      End: 'City Z',
      Stops: 'Stop',
      DateAndTime: Math.floor(Date.now() / 1000) + 3600,
      OccupiedSeats: 1
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Create route (POST /routes) with invalid credentials', async (t) => {
  const payload = {
    Start: 'City X',
    End: 'City Y',
    Stops: 'Midpoint',
    DateAndTime: Math.floor(Date.now() / 1000) + 86400,
    OccupiedSeats: 1,
    Comment: 'Test route'
  };
  const res = await client.post('routes', { json: payload });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
});

test.serial('Update non-existent route (PUT /routes/:routeID)', async (t) => {
  const res = await authClient.put('routes/676767', {
    json: {
      Start: 'City X',
      End: 'City Y',
      Stops: 'Midpoint',
      DateAndTime: Math.floor(Date.now() / 1000) + 172800,
      OccupiedSeats: 2,
      Comment: 'Updated'
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent route (DELETE /routes/:routeID)', async (t) => {
  const res = await authClient.delete('routes/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
	t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

