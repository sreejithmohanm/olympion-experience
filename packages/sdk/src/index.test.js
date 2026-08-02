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
