const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
const server = read('servers.js');
const contactClient = read('public/contact.js');
const homepage = read('public/index.html');
const envExample = read('.env.example');

test('public contact configuration exposes only the explicitly public email', () => {
  const routeStart = server.indexOf('app.get("/public-config"');
  const routeEnd = server.indexOf('\n});', routeStart) + 4;
  const publicConfigRoute = server.slice(routeStart, routeEnd);

  assert.ok(routeStart >= 0);
  assert.match(publicConfigRoute, /contactEmail: process\.env\.PUBLIC_CONTACT_EMAIL \|\| ""/);
  assert.doesNotMatch(publicConfigRoute, /JWT_SECRET|MONGODB_URI|MENTOR_INVITE_CODE/);
  assert.match(homepage, /<script src="contact\.js"><\/script>/);
  assert.match(envExample, /^PUBLIC_CONTACT_EMAIL=$/m);
});

test('public contact link validates and caches only the configured address for offline display', () => {
  assert.match(contactClient, /publicEmailPattern\.test\(email\)/);
  assert.match(contactClient, /localStorage\.setItem\(PUBLIC_CONTACT_CACHE_KEY, email\)/);
  assert.match(contactClient, /localStorage\.getItem\(PUBLIC_CONTACT_CACHE_KEY\)/);
  assert.match(contactClient, /publicContactEmail\.href = `mailto:\$\{email\}`/);
});