import got from 'got';

/**
 * Build a got client with optional Basic Auth.
 * @param {string} baseUrl
 * @param {{email:string,password:string}|null} auth
 */
export function makeClient(baseUrl, auth = null) {
  const headers = {};
  if (auth?.email && auth?.password) {
    const token = Buffer.from(`${auth.email}:${auth.password}`).toString('base64');
    headers['Authorization'] = `Basic ${token}`;
  }
  return got.extend({
    prefixUrl: baseUrl,
    responseType: 'json',
    throwHttpErrors: false,
    headers
  });
}