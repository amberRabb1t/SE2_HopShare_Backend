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

let createdReviewId;

test.serial('Create review (POST /users/:userID/reviews)', async (t) => {
  const res = await authClient.post(`users/${aliceId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  createdReviewId = res.body.data.ReviewID;
});

test.serial('List my reviews (GET /users/:userID/reviews?myReviews=true)', async (t) => {
  const res = await client.get(`users/${aliceId}/reviews`, { searchParams: { myReviews: true } });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('List reviews about me (GET /users/:userID/reviews?myReviews=false)', async (t) => {
  const res = await client.get(`users/${aliceId}/reviews`, { searchParams: { myReviews: false } });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get review by ID (GET /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await client.get(`users/${aliceId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ReviewID, createdReviewId);
});

test.serial('Get non-existent review (GET /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await client.get(`users/${aliceId}/reviews/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/reviews/${createdReviewId}`, {
    json: {
      Rating: 1,
      UserType: true,
      Description: 'Changed my mind',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${aliceId}/reviews/${createdReviewId}`, {
    json: {
      // Missing Rating
      UserType: true,
      Description: 'Changed my mind again',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${aliceId}/reviews/${createdReviewId}`, {
    json: {
      Rating: 3,
      UserType: true,
      Description: 'Changed my mind yet again',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${aliceId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create review (POST /users/:userID/reviews) with invalid body', async (t) => {
  const res = await authClient.post(`users/${aliceId}/reviews`, {
    json: {
      // Missing Rating
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create review (POST /users/:userID/reviews) with invalid credentials', async (t) => {
  const res = await client.post(`users/${aliceId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent review (PUT /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.put(`users/${aliceId}/reviews/676767`, {
    json: {
      Rating: 1,
      UserType: true,
      Description: 'Horrific',
      ReviewedUser: 2
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent review (DELETE /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/reviews/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

