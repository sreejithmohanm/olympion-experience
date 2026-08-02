const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const originalLoad = Module._load;

function loadSdkWithMock(mockSdk) {
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === '@olympion/workforce-os-sdk') {
      return mockSdk;
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  const sdkPath = require.resolve('./index.js');
  delete require.cache[sdkPath];
  return require('./index.js');
}

test.afterEach(() => {
  Module._load = originalLoad;
});

test('createExperienceSdk merges default and custom config while preserving sdk exports', () => {
  const mockSdk = {
    ping: () => 'pong'
  };

  const sdk = loadSdkWithMock(mockSdk);
  const wrapped = sdk.createExperienceSdk({
    environment: 'staging',
    region: 'us-east-1'
  });

  assert.equal(typeof wrapped.ping, 'function');
  assert.equal(wrapped.ping(), 'pong');
  assert.deepEqual(wrapped.config, {
    environment: 'staging',
    region: 'us-east-1'
  });
});

test('createExperienceSdk uses production as default environment', () => {
  const mockSdk = {
    version: '1.0.0'
  };

  const sdk = loadSdkWithMock(mockSdk);
  const wrapped = sdk.createExperienceSdk();

  assert.deepEqual(wrapped.config, {
    environment: 'production'
  });
});

test('SDK client exposes employees.list() method that is callable', async () => {
  const mockEmployees = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ];
  const mockSdk = {
    employees: {
      list: async (_params) => ({ data: mockEmployees, total: mockEmployees.length })
    }
  };

  const sdk = loadSdkWithMock(mockSdk);
  const client = sdk.createExperienceSdk({ environment: 'test' });

  assert.equal(typeof client.employees.list, 'function');
  const result = await client.employees.list();
  assert.equal(result.total, 2);
  assert.deepEqual(result.data, mockEmployees);
});

test('SDK client employees.list() forwards optional params to the underlying SDK', async () => {
  let capturedParams;
  const mockSdk = {
    employees: {
      list: async (params) => {
        capturedParams = params;
        return { data: [], total: 0 };
      }
    }
  };

  const sdk = loadSdkWithMock(mockSdk);
  const client = sdk.createExperienceSdk();

  await client.employees.list({ page: 2, pageSize: 10 });
  assert.deepEqual(capturedParams, { page: 2, pageSize: 10 });
});
