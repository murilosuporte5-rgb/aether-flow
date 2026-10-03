// Public GET only: no production credentials, cookies, user data, or writes.
import assert from 'node:assert/strict';
const base='https://aether-flow-production-0798.up.railway.app';
const get=path=>fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(15000)});
const health=await get('/api/health'); assert.equal(health.status,200);
const json=await health.json(); assert.equal(json.status,'ok'); assert.equal(json.product,'Aether Flow');
const login=await get('/login'); assert.equal(login.status,200);
const capture=await get('/capturar'); assert.equal(capture.status,200);
const recovery=await get('/recuperar-senha'); assert.equal(recovery.status,200);
const terms=await get('/termos'); assert.equal(terms.status,200);
const privacy=await get('/privacidade'); assert.equal(privacy.status,200);
const protectedRoute=await get('/contatos'); assert.ok([302,303,307,308].includes(protectedRoute.status));
assert.equal(new URL(protectedRoute.headers.get('location'),base).pathname,'/login');
console.log(JSON.stringify({check:'PUBLIC_PRODUCTION_HTTP_ONLY',health:200,product:json.product,login:200,capture:200,recovery:200,terms:200,privacy:200,protectedContacts:'redirect_to_login',writes:false,authenticatedProductionTest:false,status:'PASS'}));
