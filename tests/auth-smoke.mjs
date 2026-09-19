// Run against the local exam only: node tests/auth-smoke.mjs [--logout] [--expiry]
// No tokens or passwords are printed. No catalogue data is changed.
import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
async function request(path, { token, body, method = 'GET' } = {}) {
  const response = await fetch(origin + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  return { status: response.status, body: await response.json() };
}
const login = async (username = 'admin', password = 'admin123') => {
  const result = await request('/api/auth/login', {method:'POST', body:{username,password}});
  assert.equal(result.status,200,'login');
  assert.ok(result.body.data.refreshToken,'refresh token returned');
  return result.body.data;
};
const refresh = value => request('/api/auth/refresh', {method:'POST',body:{refreshToken:value}});
const session = await login();
assert.equal((await request('/api/auth/me', {token:session.token})).status,200);
assert.equal((await request('/api/auth/me')).status,401);
assert.equal((await refresh('invalid')).status,401);
const renewed = await refresh(session.refreshToken);
assert.equal(renewed.status,200);
assert.notEqual(renewed.body.data.token,session.token);
assert.notEqual(renewed.body.data.refreshToken,session.refreshToken);
assert.equal((await refresh(session.refreshToken)).status,401,'old refresh cannot be reused');
assert.equal((await request('/api/auth/me',{token:renewed.body.data.token})).status,200);
console.log('PASS: login, authenticated profile, rotation, invalid/reused refresh rejected.');

const concurrent = await login();
const race = await Promise.all([refresh(concurrent.refreshToken),refresh(concurrent.refreshToken)]);
assert.deepEqual(race.map(r=>r.status).sort(),[200,401]);
console.log('PASS: concurrent refresh accepts exactly one request.');

const standard = await login('user','user123');
assert.equal((await request('/api/products',{method:'POST',token:standard.token,body:{name:'Must not be created',price:1,stock:1}})).status,403);
console.log('PASS: standard user cannot create products.');

if (process.argv.includes('--logout')) {
  const current = renewed.body.data;
  const result = await request('/api/auth/logout',{method:'POST',body:{token:current.token,reason:'manual'}});
  assert.equal(result.status,200);
  assert.equal((await refresh(current.refreshToken)).status,401);
  assert.equal((await request('/api/auth/me',{token:current.token})).status,401);
  assert.equal((await request('/api/auth/me',{token:session.token})).status,401);
  assert.equal((await request('/api/products',{method:'POST',token:current.token,body:{name:'Must not be created',price:1,stock:1}})).status,401);
  assert.equal((await request('/api/auth/logout',{method:'POST',body:{token:current.token,reason:'manual'}})).status,200);
  console.log('PASS: logout revokes refresh AND all access tokens of that session; repeated logout is safe.');
}
if (process.argv.includes('--expiry')) {
  const expiring = await login();
  const claims = JSON.parse(Buffer.from(expiring.token.split('.')[1],'base64url').toString());
  const wait = claims.exp*1000-Date.now()+1200;
  assert.ok(wait < 70000, 'Use the exam configuration of 60-second access tokens.');
  console.log('Waiting for real JWT expiry (about one minute)...');
  await new Promise(resolve=>setTimeout(resolve,wait));
  assert.equal((await request('/api/auth/me',{token:expiring.token})).status,401);
  const next = await refresh(expiring.refreshToken);
  assert.equal(next.status,200);
  assert.equal((await request('/api/auth/me',{token:next.body.data.token})).status,200);
  console.log('PASS: expired JWT rejected; refresh restores authenticated access.');
}
