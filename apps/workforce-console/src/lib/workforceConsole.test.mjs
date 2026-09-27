import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAssignWork,
  clearStoredJwt,
  decodeJwtPayload,
  EMPLOYEE_CATALOG,
  createWorkItem,
  exchangeApiKeyForJwt,
  getIdleEmployees,
  getStoredJwt,
  hireEmployee,
  INVALID_API_KEY_ERROR_MESSAGE,
  isJwtExpired,
  SESSION_JWT_STORAGE_KEY,
  storeJwt,
  setEmployeeStatus,
  tokenizeResponse
} from './workforceConsole.mjs';

test('hireEmployee adds status only once per employee', () => {
  const firstHire = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const secondHire = hireEmployee(firstHire, EMPLOYEE_CATALOG[0]);

  assert.equal(firstHire.length, 1);
  assert.equal(firstHire[0].status, 'idle');
  assert.equal(secondHire.length, 1);
});

test('tokenizeResponse includes employee name and prompt content', () => {
  const tokens = tokenizeResponse('Draft a release note', 'Ari Architect');

  assert.ok(tokens.includes('Ari'));
  assert.ok(tokens.some((token) => token.includes('release')));
});

test('createWorkItem builds a streaming work item', () => {
  const hiredEmployees = hireEmployee([], EMPLOYEE_CATALOG[1]);
  const workItem = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[1].id,
    prompt: 'Summarize customer feedback',
    hiredEmployees
  });

  assert.equal(workItem.employeeName, EMPLOYEE_CATALOG[1].name);
  assert.equal(workItem.status, 'streaming');
  assert.ok(workItem.tokens.length > 0);
  assert.match(workItem.id, /^work-/);
  assert.ok(!Number.isNaN(Date.parse(workItem.createdAt)));
});

test('createWorkItem generates unique ids across multiple assignments', () => {
  const hiredEmployees = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const first = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[0].id,
    prompt: 'First prompt',
    hiredEmployees
  });
  const second = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[0].id,
    prompt: 'Second prompt',
    hiredEmployees
  });

  assert.notEqual(first.id, second.id);
});

test('setEmployeeStatus updates busy/idle state and idle filtering', () => {
  const hired = hireEmployee([], EMPLOYEE_CATALOG[2]);
  const busyEmployees = setEmployeeStatus(
    hired,
    EMPLOYEE_CATALOG[2].id,
    'busy'
  );

  assert.equal(busyEmployees[0].status, 'busy');
  assert.equal(getIdleEmployees(busyEmployees).length, 0);

  const idleEmployees = setEmployeeStatus(
    busyEmployees,
    EMPLOYEE_CATALOG[2].id,
    'idle'
  );
  assert.equal(getIdleEmployees(idleEmployees).length, 1);
});

test('canAssignWork rejects non-idle employees and active streams', () => {
  const hired = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const busy = setEmployeeStatus(hired, EMPLOYEE_CATALOG[0].id, 'busy');

  assert.equal(
    canAssignWork({
      hiredEmployees: busy,
      selectedEmployeeId: EMPLOYEE_CATALOG[0].id,
      prompt: 'Do work',
      hasStreamingWork: false
    }),
    false
  );

  assert.equal(
    canAssignWork({
      hiredEmployees: hired,
      selectedEmployeeId: EMPLOYEE_CATALOG[0].id,
      prompt: 'Do work',
      hasStreamingWork: true
    }),
    false
  );
});

test('createWorkItem throws if employee is missing', () => {
  assert.throws(
    () =>
      createWorkItem({
        employeeId: 'missing',
        prompt: 'Hello',
        hiredEmployees: []
      }),
    /Employee is required/
  );
});

test('session JWT helpers use the configured storage key', () => {
  const mockStorage = {
    values: new Map(),
    getItem(key) {
      return this.values.has(key) ? this.values.get(key) : null;
    },
    setItem(key, value) {
      this.values.set(key, value);
    },
    removeItem(key) {
      this.values.delete(key);
    }
  };

  storeJwt('jwt-value', mockStorage);
  assert.equal(mockStorage.getItem(SESSION_JWT_STORAGE_KEY), 'jwt-value');
  assert.equal(getStoredJwt(mockStorage), 'jwt-value');

  clearStoredJwt(mockStorage);
  assert.equal(getStoredJwt(mockStorage), '');
});

test('decodeJwtPayload parses payload and isJwtExpired respects exp claim', () => {
  const toBase64Url = (value) =>
    Buffer.from(value, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  const makeJwt = (payload) =>
    `header.${toBase64Url(JSON.stringify(payload))}.signature`;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const activeJwt = makeJwt({ exp: nowSeconds + 300, keySuffix: '1234' });
  const expiredJwt = makeJwt({ exp: nowSeconds - 5 });

  assert.deepEqual(decodeJwtPayload(activeJwt).keySuffix, '1234');
  assert.equal(isJwtExpired(activeJwt, Date.now()), false);
  assert.equal(isJwtExpired(expiredJwt, Date.now()), true);
  assert.equal(isJwtExpired('not-a-jwt', Date.now()), true);
});

test('exchangeApiKeyForJwt uses SDK auth method and normalizes invalid key errors', async () => {
  const sdk = {
    auth: {
      exchangeApiKeyForJwt: async (apiKey) => {
        assert.equal(apiKey, 'opx_live_good');
        return { jwt: 'jwt-token' };
      }
    }
  };

  const jwt = await exchangeApiKeyForJwt({
    apiKey: '  opx_live_good  ',
    sdk
  });
  assert.equal(jwt, 'jwt-token');

  await assert.rejects(
    exchangeApiKeyForJwt({
      apiKey: 'bad-key',
      sdk: {
        auth: {
          exchangeApiKeyForJwt: async () => {
            const error = new Error('Unauthorized');
            error.status = 401;
            throw error;
          }
        }
      }
    }),
    new Error(INVALID_API_KEY_ERROR_MESSAGE)
  );

  const fallbackJwt = await exchangeApiKeyForJwt({
    apiKey: 'opx_live_alt',
    sdk: {
      auth: {
        loginWithApiKey: async () => ({
          data: {
            accessToken: 'alt-jwt-token'
          }
        })
      }
    }
  });
  assert.equal(fallbackJwt, 'alt-jwt-token');
});

test('exchangeApiKeyForJwt fails when SDK auth method is unavailable', async () => {
  await assert.rejects(
    exchangeApiKeyForJwt({
      apiKey: 'opx_live_any',
      sdk: {}
    }),
    /SDK authentication method is not available/
  );
});

test('exchangeApiKeyForJwt rejects non-string token responses', async () => {
  await assert.rejects(
    exchangeApiKeyForJwt({
      apiKey: 'opx_live_any',
      sdk: {
        auth: {
          exchangeApiKeyForJwt: async () => ({
            token: {
              value: 'not-a-string'
            }
          })
        }
      }
    }),
    /Authentication did not return a JWT/
  );
});
