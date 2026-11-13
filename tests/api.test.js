import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../server/db.js';
import { createApp } from '../server/app.js';
import { seedDatabase } from '../server/seedData.js';

const PASSWORD = 'Testpass123';
let server;
let baseUrl;
let db;

// Minimal client that keeps the session cookie between calls, like a browser would.
class Session {
  cookie = '';

  async call(method, url, body) {
    const res = await fetch(baseUrl + url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(this.cookie && { Cookie: this.cookie }) },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    });
    const setCookies = res.headers.getSetCookie();
    if (setCookies.length) this.cookie = setCookies.map((c) => c.split(';')[0]).join('; ');
    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  }

  get(url) { return this.call('GET', url); }
  post(url, body) { return this.call('POST', url, body); }
  patch(url, body) { return this.call('PATCH', url, body); }
}

async function signIn(email) {
  const session = new Session();
  const res = await session.post('/api/auth/login', { email, password: PASSWORD });
  assert.equal(res.status, 200, `login failed for ${email}: ${JSON.stringify(res.data)}`);
  return session;
}

const softwareId = (name) => db.prepare('SELECT id FROM software WHERE name = ?').get(name).id;
const deptId = (name) => db.prepare('SELECT id FROM departments WHERE name = ?').get(name).id;

const newRequest = (name, extra = {}) => ({
  softwareId: softwareId(name),
  deviceTag: 'LT-0042',
  justification: 'Needed for the payments service rewrite this quarter.',
  urgency: 'normal',
  ...extra,
});

let sneha, karan, ravi, meera, arjun, admin;

before(async () => {
  db = openDatabase(':memory:');
  seedDatabase(db, PASSWORD);
  const app = createApp(db, { authRateLimit: 1000 });
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  sneha = await signIn('sneha.reddy@example.com');   // employee, Engineering
  karan = await signIn('karan.mehta@example.com');   // employee, Finance
  ravi = await signIn('ravi.kumar@example.com');     // manager, Engineering
  meera = await signIn('meera.nair@example.com');    // manager, Finance
  arjun = await signIn('arjun.patel@example.com');   // IT support
  admin = await signIn('admin@example.com');
});

after(() => {
  server.close();
  db.close();
});

test('registration creates an employee even if a role is sent', async () => {
  const s = new Session();
  const res = await s.post('/api/auth/register', {
    name: 'New Person', email: 'new.person@example.com', password: 'Password1',
    departmentId: deptId('Marketing'), role: 'admin',
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.user.role, 'employee');

  const me = await s.get('/api/auth/me');
  assert.equal(me.status, 200);
  assert.equal(me.data.user.email, 'new.person@example.com');
});

test('registration rejects weak passwords and duplicate emails', async () => {
  const weak = await new Session().post('/api/auth/register', {
    name: 'Weak', email: 'weak@example.com', password: 'short', departmentId: deptId('Finance'),
  });
  assert.equal(weak.status, 400);

  const dup = await new Session().post('/api/auth/register', {
    name: 'Dup', email: 'SNEHA.REDDY@example.com', password: 'Password1', departmentId: deptId('Finance'),
  });
  assert.equal(dup.status, 409);
});

test('login fails with a wrong password, and protected routes need a session', async () => {
  const res = await new Session().post('/api/auth/login', { email: 'sneha.reddy@example.com', password: 'wrong-pass1' });
  assert.equal(res.status, 401);

  const anon = await new Session().get('/api/requests');
  assert.equal(anon.status, 401);
});

test('a forged session cookie is rejected', async () => {
  const s = new Session();
  s.cookie = 'sra_session=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.invalidsignature';
  const res = await s.get('/api/auth/me');
  assert.equal(res.status, 401);
});

test('full approval path: submit, manager approve, IT approve, install, close', async () => {
  const created = await sneha.post('/api/requests', newRequest('Visual Studio Code'));
  assert.equal(created.status, 201);
  const id = created.data.id;

  // Duplicate while the first one is open
  const dup = await sneha.post('/api/requests', newRequest('Visual Studio Code'));
  assert.equal(dup.status, 409);

  // The employee cannot approve their own request
  const selfApprove = await sneha.post(`/api/requests/${id}/actions`, { action: 'manager_approve' });
  assert.equal(selfApprove.status, 403);

  // A manager from another department cannot even see it
  const otherManager = await meera.post(`/api/requests/${id}/actions`, { action: 'manager_approve' });
  assert.equal(otherManager.status, 404);

  // IT cannot skip the manager step
  const skip = await arjun.post(`/api/requests/${id}/actions`, { action: 'it_approve' });
  assert.equal(skip.status, 404);

  const pending = await ravi.get('/api/requests?view=approvals');
  assert.ok(pending.data.requests.some((r) => r.id === id));

  const approve = await ravi.post(`/api/requests/${id}/actions`, { action: 'manager_approve', note: 'Fine by me' });
  assert.equal(approve.status, 200);
  assert.equal(approve.data.status, 'pending_it');

  // Approving twice is an invalid transition
  const again = await ravi.post(`/api/requests/${id}/actions`, { action: 'manager_approve' });
  assert.equal(again.status, 409);

  // Installing before IT approval is an invalid transition
  const early = await arjun.post(`/api/requests/${id}/actions`, { action: 'mark_installed', note: 'x' });
  assert.equal(early.status, 409);

  const itApprove = await arjun.post(`/api/requests/${id}/actions`, { action: 'it_approve' });
  assert.equal(itApprove.data.status, 'in_progress');

  const noNotes = await arjun.post(`/api/requests/${id}/actions`, { action: 'mark_installed' });
  assert.equal(noNotes.status, 400);

  const installed = await arjun.post(`/api/requests/${id}/actions`, {
    action: 'mark_installed', note: 'Installed 1.95 via Intune',
  });
  assert.equal(installed.data.status, 'installed');

  const closed = await sneha.post(`/api/requests/${id}/actions`, { action: 'close' });
  assert.equal(closed.data.status, 'closed');

  const detail = await sneha.get(`/api/requests/${id}`);
  assert.equal(detail.status, 200);
  assert.deepEqual(
    detail.data.events.map((e) => e.action),
    ['submit', 'manager_approve', 'it_approve', 'mark_installed', 'close'],
  );
  assert.equal(detail.data.request.assigneeName, 'Arjun Patel');
  assert.ok(detail.data.request.installedAt);

  // After closing, the same software can be requested again
  const again2 = await sneha.post('/api/requests', newRequest('Visual Studio Code'));
  assert.equal(again2.status, 201);
});

test('manager rejection needs a reason and is visible to the employee', async () => {
  const { data } = await sneha.post('/api/requests', newRequest('Postman'));

  const noReason = await ravi.post(`/api/requests/${data.id}/actions`, { action: 'manager_reject' });
  assert.equal(noReason.status, 400);

  const rejected = await ravi.post(`/api/requests/${data.id}/actions`, {
    action: 'manager_reject', note: 'Use the shared Postman workspace instead.',
  });
  assert.equal(rejected.data.status, 'rejected');

  const detail = await sneha.get(`/api/requests/${data.id}`);
  assert.equal(detail.data.request.rejectionReason, 'Use the shared Postman workspace instead.');
});

test('IT can reject after manager approval', async () => {
  const { data } = await karan.post('/api/requests', newRequest('Power BI Desktop'));
  await meera.post(`/api/requests/${data.id}/actions`, { action: 'manager_approve' });
  const res = await arjun.post(`/api/requests/${data.id}/actions`, {
    action: 'it_reject', note: 'Not supported on your laptop model.',
  });
  assert.equal(res.data.status, 'rejected');
});

test('licensed software needs a longer reason', async () => {
  const res = await sneha.post('/api/requests', newRequest('Adobe Photoshop', { justification: 'For banners.' }));
  assert.equal(res.status, 400);
  assert.match(res.data.error, /paid license/);
});

test('IT approval stops when no licenses are left', async () => {
  const tableauId = softwareId('Tableau Desktop');
  const set = await admin.patch(`/api/software/${tableauId}`, { licenseCount: 1 });
  assert.equal(set.status, 200);

  const reason = 'Quarterly revenue dashboards for the finance leadership review.';
  const first = await karan.post('/api/requests', newRequest('Tableau Desktop', { justification: reason }));
  const second = await sneha.post('/api/requests', newRequest('Tableau Desktop', { justification: reason }));

  await meera.post(`/api/requests/${first.data.id}/actions`, { action: 'manager_approve' });
  await ravi.post(`/api/requests/${second.data.id}/actions`, { action: 'manager_approve' });

  const ok = await arjun.post(`/api/requests/${first.data.id}/actions`, { action: 'it_approve' });
  assert.equal(ok.status, 200);

  const blocked = await arjun.post(`/api/requests/${second.data.id}/actions`, { action: 'it_approve' });
  assert.equal(blocked.status, 409);
  assert.match(blocked.data.error, /licenses are free/);
});

test('employee can cancel a pending request but not an installed one', async () => {
  const { data } = await sneha.post('/api/requests', newRequest('Git'));
  const other = await karan.post(`/api/requests/${data.id}/actions`, { action: 'cancel' });
  assert.equal(other.status, 404);

  const cancel = await sneha.post(`/api/requests/${data.id}/actions`, { action: 'cancel' });
  assert.equal(cancel.data.status, 'cancelled');

  const twice = await sneha.post(`/api/requests/${data.id}/actions`, { action: 'cancel' });
  assert.equal(twice.status, 409);
});

test('employees only see their own requests', async () => {
  const mine = await karan.get('/api/requests?view=mine');
  assert.ok(mine.data.requests.length > 0);
  assert.ok(mine.data.requests.every((r) => r.requesterName === 'Karan Mehta'));

  const all = await karan.get('/api/requests');
  assert.ok(all.data.requests.every((r) => r.requesterName === 'Karan Mehta'));

  const snehaRequest = db.prepare(
    "SELECT r.id FROM requests r JOIN users u ON u.id = r.user_id WHERE u.email = 'sneha.reddy@example.com' LIMIT 1",
  ).get();
  const peek = await karan.get(`/api/requests/${snehaRequest.id}`);
  assert.equal(peek.status, 404);
});

test('role-restricted endpoints refuse other roles', async () => {
  assert.equal((await sneha.get('/api/admin/users')).status, 403);
  assert.equal((await sneha.get('/api/stats')).status, 403);
  assert.equal((await sneha.get('/api/requests?view=approvals')).status, 403);
  assert.equal((await ravi.get('/api/requests?view=queue')).status, 403);
  assert.equal((await arjun.get('/api/admin/audit')).status, 403);
  assert.equal((await ravi.post('/api/software', { name: 'X', vendor: 'Y', category: 'Z' })).status, 403);
});

test('admin changes a role; it applies at once and is written to the audit log', async () => {
  const karanId = db.prepare("SELECT id FROM users WHERE email = 'karan.mehta@example.com'").get().id;

  const res = await admin.patch(`/api/admin/users/${karanId}`, { role: 'manager' });
  assert.equal(res.data.user.role, 'manager');

  // Same session, new role, no new login needed
  const me = await karan.get('/api/auth/me');
  assert.equal(me.data.user.role, 'manager');

  const audit = await admin.get('/api/admin/audit');
  assert.ok(audit.data.entries.some((e) => e.action === 'user.updated' && e.target === `user:${karanId}`));

  await admin.patch(`/api/admin/users/${karanId}`, { role: 'employee' });

  const self = await admin.patch(`/api/admin/users/${db.prepare("SELECT id FROM users WHERE email='admin@example.com'").get().id}`, { role: 'employee' });
  assert.equal(self.status, 400);
});

test('deactivated users are signed out immediately', async () => {
  const s = new Session();
  await s.post('/api/auth/register', {
    name: 'Temp User', email: 'temp.user@example.com', password: 'Password1', departmentId: deptId('Finance'),
  });
  const id = db.prepare("SELECT id FROM users WHERE email = 'temp.user@example.com'").get().id;
  await admin.patch(`/api/admin/users/${id}`, { isActive: false });
  assert.equal((await s.get('/api/auth/me')).status, 401);
});

test('stats are calculated from stored data and scoped for managers', async () => {
  const all = await admin.get('/api/stats');
  assert.equal(all.status, 200);
  const dbTotal = db.prepare('SELECT COUNT(*) AS n FROM requests').get().n;
  assert.equal(all.data.totals.all, dbTotal);
  assert.equal(all.data.sla.finished, db.prepare('SELECT COUNT(*) AS n FROM requests WHERE installed_at IS NOT NULL').get().n);
  assert.ok(all.data.topSoftware.length > 0);

  const eng = await ravi.get('/api/stats');
  const engTotal = db.prepare(
    "SELECT COUNT(*) AS n FROM requests WHERE department_id = (SELECT id FROM departments WHERE name='Engineering')",
  ).get().n;
  assert.equal(eng.data.totals.all, engTotal);
  assert.equal(eng.data.scope, 'Engineering');
});

test('non-JSON writes are refused', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'email=a@b.com&password=x',
  });
  assert.equal(res.status, 415);
});

test('data survives a restart when using a database file', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sra-')), 'test.db');
  const first = openDatabase(file);
  seedDatabase(first, PASSWORD);
  first.close();

  const second = openDatabase(file);
  const users = second.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  second.close();
  assert.ok(users >= 7);
});
