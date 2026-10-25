import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCustomerAuth,
  CUSTOMER_SESSION_STORAGE_KEY
} from './customerAuth.mjs';

function createStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
}

function makeJwt(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.signature`;
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

test('customer registration submits a request for CRM approval', async () => {
  const calls = [];
  const auth = createCustomerAuth({
    apiBaseUrl: 'https://api.example.test/',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return jsonResponse({ status: 'pending_approval' }, 202);
    },
    storage: createStorage()
  });

  const response = await auth.registerCustomer({
    fullName: '  Alex Customer ',
    companyName: ' Acme ',
    email: ' alex@example.test ',
    password: 'secret'
  });

  assert.deepEqual(response, { status: 'pending_approval' });
  assert.equal(
    calls[0].url,
    'https://api.example.test/v1/auth/customer/register'
  );
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    full_name: 'Alex Customer',
    company_name: 'Acme',
    email: 'alex@example.test',
    password: 'secret'
  });
});

test('login stores access and refresh tokens in the browser session', async () => {
  const storage = createStorage();
  const auth = createCustomerAuth({
    fetchImpl: async (_url, options) => {
      assert.equal(options.method, 'POST');
      return jsonResponse({
        access_token: makeJwt({ exp: Math.floor(Date.now() / 1000) + 300 }),
        refresh_token: 'refresh-token'
      });
    },
    storage
  });

  const session = await auth.login({
    email: 'customer@example.test',
    password: 'password'
  });

  assert.equal(session.refreshToken, 'refresh-token');
  assert.equal(
    JSON.parse(storage.getItem(CUSTOMER_SESSION_STORAGE_KEY)).accessToken,
    session.accessToken
  );
});

test('expired sessions refresh and replace the access token', async () => {
  const storage = createStorage();
  storage.setItem(
    CUSTOMER_SESSION_STORAGE_KEY,
    JSON.stringify({
      accessToken: makeJwt({ exp: 1 }),
      refreshToken: 'refresh-token'
    })
  );
  let requestBody;
  const nextToken = makeJwt({ exp: Math.floor(Date.now() / 1000) + 600 });
  const auth = createCustomerAuth({
    fetchImpl: async (url, options) => {
      assert.equal(url, '/v1/auth/refresh');
      requestBody = JSON.parse(options.body);
      return jsonResponse({ access_token: nextToken });
    },
    storage
  });

  const session = await auth.refreshSession();

  assert.deepEqual(requestBody, { refresh_token: 'refresh-token' });
  assert.equal(session.accessToken, nextToken);
  assert.equal(session.refreshToken, 'refresh-token');
});

test('logout clears the browser session even when the service is unavailable', async () => {
  const storage = createStorage();
  storage.setItem(
    CUSTOMER_SESSION_STORAGE_KEY,
    JSON.stringify({ accessToken: 'token', refreshToken: 'refresh-token' })
  );
  const auth = createCustomerAuth({
    fetchImpl: async () => {
      throw new Error('offline');
    },
    storage
  });

  await assert.rejects(auth.logout(), /Unable to reach/);
  assert.equal(storage.getItem(CUSTOMER_SESSION_STORAGE_KEY), null);
});
