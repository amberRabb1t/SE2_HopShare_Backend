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

// seeded in mock data
const bobId = 2;
const bobReviewId = 2;
const aliceId = 1 
const aliceReviewId = 1;

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
  Tests for endpoints under /users/:userID/reviews
  Includes tests for all CRUD operations and covers both success and failure cases, e.g.
  invalid input parameters (path and body), non-existent resources, lack of authentication or authorization,
  admin overrides, etc.
*/

let createdReviewId;

test.serial('Create review (POST /users/:userID/reviews)', async (t) => {
  const res = await authClient.post(`users/${bobId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  createdReviewId = res.body.data.ReviewID;
});

test.serial('List my reviews (GET /users/:userID/reviews?myReviews=true)', async (t) => {
  const res = await client.get(`users/${bobId}/reviews`, { searchParams: { myReviews: true } });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('List reviews about me (GET /users/:userID/reviews?myReviews=false)', async (t) => {
  const res = await client.get(`users/${bobId}/reviews`, { searchParams: { myReviews: false } });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get review by ID (GET /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await client.get(`users/${bobId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ReviewID, createdReviewId);
});

test.serial('Get non-existent review (GET /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await client.get(`users/${bobId}/reviews/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/reviews/${createdReviewId}`, {
    json: {
      Rating: 1,
      UserType: true,
      Description: 'Changed my mind',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) with invalid body', async (t) => {
  const res = await authClient.put(`users/${bobId}/reviews/${createdReviewId}`, {
    json: {
      // Missing Rating
      UserType: true,
      Description: 'Changed my mind again',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) with invalid credentials', async (t) => {
  const res = await client.put(`users/${bobId}/reviews/${createdReviewId}`, {
    json: {
      Rating: 3,
      UserType: true,
      Description: 'Changed my mind yet again',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) with invalid authorization', async (t) => {
  const res = await authClient.put(`users/${aliceId}/reviews/${aliceReviewId}`, {
    json: {
      Rating: 3,
      UserType: true,
      Description: 'Changed my mind yet again',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID) with invalid credentials', async (t) => {
  const res = await client.delete(`users/${bobId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID) with invalid authorization', async (t) => {
  const res = await authClient.delete(`users/${aliceId}/reviews/${aliceReviewId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/reviews/${createdReviewId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

test.serial('Create review (POST /users/:userID/reviews) with invalid body', async (t) => {
  const res = await authClient.post(`users/${bobId}/reviews`, {
    json: {
      // Missing Rating
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 400);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create review (POST /users/:userID/reviews) with invalid credentials', async (t) => {
  const res = await client.post(`users/${bobId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create review (POST /users/:userID/reviews) with invalid authorization', async (t) => {
  const res = await authClient.post(`users/${aliceId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Create review (POST /users/:userID/reviews) connected to non-existent user', async (t) => {
  const res = await adminClient.post(`users/676767/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Update non-existent review (PUT /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.put(`users/${bobId}/reviews/676767`, {
    json: {
      Rating: 1,
      UserType: true,
      Description: 'Horrific',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete non-existent review (DELETE /users/:userID/reviews/:reviewID)', async (t) => {
  const res = await authClient.delete(`users/${bobId}/reviews/676767`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Get review (GET /users/:userID/reviews/:reviewID) of non-existent user', async (t) => {
  const res = await adminClient.get(`users/676767/reviews/${aliceReviewId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) of non-existent user', async (t) => {
  const res = await adminClient.put(`users/676767/reviews/${aliceReviewId}`, {
    json: {
      Rating: 1,
      UserType: true,
      Description: 'Horrific',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID) of non-existent user', async (t) => {
  const res = await adminClient.delete(`users/676767/reviews/${aliceReviewId}`);
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// Admin overrides

test.serial('Create review (POST /users/:userID/reviews) via admin override', async (t) => {
  const res = await adminClient.post(`users/${bobId}/reviews`, {
    json: {
      Rating: 5,
      UserType: true,
      Description: 'Excellent driver',
      ReviewedUser: 4
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Update review (PUT /users/:userID/reviews/:reviewID) via admin override', async (t) => {
  const res = await adminClient.put(`users/${bobId}/reviews/${bobReviewId}`, {
    json: {
      Rating: 5,
      UserType: false,
      Description: 'uhhmm. i dont really know',
      ReviewedUser: 3
    }
  });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
});

test.serial('Delete review (DELETE /users/:userID/reviews/:reviewID) via admin override', async (t) => {
  const res = await adminClient.delete(`users/${bobId}/reviews/${bobReviewId}`);
  t.is(res.statusCode, 204);
  t.falsy(res.body);
  t.truthy(res.statusMessage);
});

