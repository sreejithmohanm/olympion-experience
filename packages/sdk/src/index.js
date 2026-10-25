function loadWorkforceOsSdk() {
  try {
    return {
      sdk: require('@olympion/workforce-os-sdk'),
      loadError: null
    };
  } catch (error) {
    if (
      error &&
      error.code === 'MODULE_NOT_FOUND' &&
      typeof error.message === 'string' &&
      error.message.includes('@olympion/workforce-os-sdk')
    ) {
      return {
        sdk: {},
        loadError: error
      };
    }

    throw error;
  }
}

const { sdk: workforceOS, loadError: workforceOSLoadError } =
  loadWorkforceOsSdk();

function createMissingSdkMethodError(propertyName) {
  return new Error(
    `The optional dependency "@olympion/workforce-os-sdk" is not available. Install it to use workforce SDK operation "${propertyName}".`
  );
}

const DEV_API_KEY = 'opx_dev_test';

function base64UrlEncode(value) {
  const encoded = Buffer.from(JSON.stringify(value)).toString('base64');
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function buildDevJwt(keySuffix) {
  const header = base64UrlEncode({ alg: 'none', typ: 'JWT' });
  const expiry = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const payload = base64UrlEncode({ keySuffix, exp: expiry, env: 'dev' });
  return `${header}.${payload}.dev-sig`;
}

function createDevAuthStub() {
  return {
    exchangeApiKeyForJwt(apiKey) {
      if (apiKey !== DEV_API_KEY) {
        const error = new Error('Invalid API key. Please check your key and try again.');
        error.status = 401;
        return Promise.reject(error);
      }

      const keySuffix = DEV_API_KEY.slice(-4);
      return Promise.resolve(buildDevJwt(keySuffix));
    }
  };
}

/**
 * Live auth stub: calls POST /v1/auth/token via fetch (browser-compatible).
 * Used when @olympion/workforce-os-sdk is unavailable at build time but the
 * Nginx proxy is wiring /v1/auth/* to the identity service at runtime.
 */
function createLiveAuthStub() {
  return {
    async exchangeApiKeyForJwt(apiKey) {
      let response;
      try {
        response = await fetch('/v1/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: apiKey })
        });
      } catch (networkError) {
        throw new Error('Unable to reach the authentication service.');
      }

      let body;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        const error = new Error(
          body?.detail || body?.message || 'Invalid API key. Please check your key and try again.'
        );
        error.status = response.status;
        throw error;
      }

      const token = body?.access_token || body?.token || body?.jwt || '';
      if (!token) {
        throw new Error('Authentication did not return a token.');
      }

      return token;
    }
  };
}

function createExperienceSdk(config = {}) {
  const sdkConfig = {
    environment: config.environment ?? 'production',
    ...config
  };

  if (workforceOSLoadError) {
    // In a static export served by Nginx, the SDK is not available server-side
    // at build time. At runtime in the browser, /v1/auth/* is proxied to the
    // identity service, so we use the live fetch-based stub.
    const isDevMode =
      typeof process !== 'undefined' && process.env.OLYMPION_DEV_MODE === 'true';
    const authStub = isDevMode ? createDevAuthStub() : createLiveAuthStub();

    return new Proxy(
      {
        config: sdkConfig,
        auth: undefined,
        ...authStub
      },
      {
        get(target, propertyName, receiver) {
          if (propertyName in target) {
            return Reflect.get(target, propertyName, receiver);
          }

          throw createMissingSdkMethodError(String(propertyName));
        }
      }
    );
  }

  return {
    ...workforceOS,
    config: sdkConfig
  };
}

module.exports = {
  ...workforceOS,
  createExperienceSdk
};
