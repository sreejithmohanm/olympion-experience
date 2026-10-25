import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approveContact,
  fetchPendingContacts,
  rejectContact
} from './crmApproval.mjs';

function mockFetch(body, { ok = true, status = 200 } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok, status, json: async () => body };
  };
  return { calls, fetchImpl };
}

test('fetchPendingContacts requests pending contacts with the JWT', async () => {
  const { calls, fetchImpl } = mockFetch({
    contacts: [{ contact_id: 'c1', email: 'a@b.com' }]
  });
  const result = await fetchPendingContacts({ jwt: 'tok', fetchImpl });
  assert.equal(result.length, 1);
  assert.equal(calls[0].url, '/v1/auth/contacts?status=pending');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer tok');
});

test('approveContact and rejectContact PATCH the status endpoint', async () => {
  const approve = mockFetch({ status: 'approved' });
  await approveContact({
    jwt: 'tok',
    contactId: 'c/1',
    fetchImpl: approve.fetchImpl
  });
  assert.equal(approve.calls[0].url, '/v1/auth/contacts/c%2F1/status');
  assert.equal(approve.calls[0].init.method, 'PATCH');
  assert.deepEqual(JSON.parse(approve.calls[0].init.body), {
    status: 'approved'
  });

  const reject = mockFetch({ status: 'rejected' });
  await rejectContact({
    jwt: 'tok',
    contactId: 'c1',
    fetchImpl: reject.fetchImpl
  });
  assert.deepEqual(JSON.parse(reject.calls[0].init.body), {
    status: 'rejected'
  });
});

test('errors surface the API message', async () => {
  const { fetchImpl } = mockFetch(
    { detail: 'Forbidden' },
    { ok: false, status: 403 }
  );
  await assert.rejects(
    fetchPendingContacts({ jwt: 'tok', fetchImpl }),
    /Forbidden/
  );
});
