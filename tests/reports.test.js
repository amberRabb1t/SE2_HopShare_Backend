import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;
let authClient;
let adminClient;

const bobAuth = { email: 'bob@example.com', password: 'password123' };
const aliceAuth = { email: 'alice@example.com', password: 'password123' };

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
  authClient = makeClient(serverCtx.url, bobAuth);
  adminClient = makeClient(serverCtx.url, aliceAuth);
});

test.after.always(async () => {
  await serverCtx.close();
});

let createdReportId;

test.serial('Create report (POST /reports)', async (t) => {
  const res = await authClient.post('reports', {
    json: {
      Description: 'Test report',
      ReportedUser: 2
    }
  });
  t.is(res.statusCode, 201);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.truthy(res.body.data.ReportID);
  createdReportId = res.body.data.ReportID;
});

test.serial('Create report (POST /reports) with invalid credentials', async (t) => {
  const res = await client.post('reports', {
    json: {
      Description: 'Test report No. 2',
      ReportedUser: 1
    }
  });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('List reports (GET /reports?UserID=2)', async (t) => {
  const res = await adminClient.get('reports', { searchParams: { UserID: 2 } });
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.true(Array.isArray(res.body.data));
});

test.serial('Get report by ID (GET /reports/:reportID)', async (t) => {
  const res = await adminClient.get(`reports/${createdReportId}`);
  t.is(res.statusCode, 200);
  t.is(res.body.success, true);
  t.truthy(res.body.message);
  t.is(res.body.data.ReportID, createdReportId);
});

test.serial('Get non-existent report (GET /reports/:reportID)', async (t) => {
  const res = await adminClient.get('reports/676767');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

// test.serial('Create report (POST /reports) against non-existent user', async (t) => {
//   const res = await authClient.post('reports', {
//     json: {
//       Description: 'Test report',
//       ReportedUser: 676767
//     }
//   });
//   t.is(res.statusCode, 404);
//   t.is(res.body.success, false);
//   t.truthy(res.body.message);
//   t.is(res.body.error, 'NOT_FOUND');
// });

test.serial('List reports (GET /reports?UserID=2) with invalid credentials', async (t) => {
  const res = await client.get('reports', { searchParams: { UserID: 2 } });
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('List reports (GET /reports?UserID=2) with invalid authorization', async (t) => {
  const res = await authClient.get('reports', { searchParams: { UserID: 2 } });
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get report by ID (GET /reports/:reportID) with invalid credentials', async (t) => {
  const res = await client.get(`reports/${createdReportId}`);
  t.is(res.statusCode, 401);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Get report by ID (GET /reports/:reportID) with invalid authorization', async (t) => {
  const res = await authClient.get(`reports/${createdReportId}`);
  t.is(res.statusCode, 403);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
});

test.serial('Non-existent route returns 404', async (t) => {
  const res = await client.get('this-route-does-not-exist');
  t.is(res.statusCode, 404);
  t.is(res.body.success, false);
  t.truthy(res.body.message);
  t.is(res.body.error, 'NOT_FOUND');
});

