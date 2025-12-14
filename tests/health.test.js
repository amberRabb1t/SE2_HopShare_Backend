import test from 'ava';
import { startTestServer } from './helpers/server.js';
import { makeClient } from './helpers/http.js';

let serverCtx;
let client;

test.before(async () => {
  serverCtx = await startTestServer();
  client = makeClient(serverCtx.url);
});

test.after.always(async () => {
  await serverCtx.close();
});

test('Health check returns OK', async (t) => {
  const res = await client.get('health');
  t.is(res.statusCode, 200);
  t.truthy(res.body);
  t.is(res.body.success, true);
  t.is(res.body.data.status, 'ok');
});

