export const CUSTOMER_SESSION_STORAGE_KEY = 'olympion.customer.session';
export const SESSION_EXPIRED_MESSAGE =
  'Your session expired. Please sign in again.';

function decodeJwtPayload(token) {
  const encodedPayload = token?.split('.')[1];
  if (!encodedPayload) {
    return null;
  }

  try {
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token, now = Date.now()) {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return true;
  }

  return typeof payload.exp === 'number' && payload.exp * 1000 <= now;
}

function getSession(storage) {
  try {
    return JSON.parse(storage?.getItem(CUSTOMER_SESSION_STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function getToken(response, keys) {
  for (const body of [response, response?.data]) {
    for (const key of keys) {
      if (typeof body?.[key] === 'string') {
        return body[key];
      }
    }
  }

  return '';
}

export function createCustomerAuth({
  apiBaseUrl = process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL ?? '',
  fetchImpl = fetch,
  storage = globalThis.sessionStorage
} = {}) {
  const request = async (path, { body, token, ...options } = {}) => {
    let response;
    try {
      response = await fetchImpl(`${apiBaseUrl.replace(/\/+$/, '')}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
          ...options.headers
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
    } catch {
      throw new Error('Unable to reach the authentication service.');
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = null;
    }

    if (!response.ok) {
      const error = new Error(
        result?.detail ||
          result?.message ||
          result?.error?.message ||
          `Request failed (${response.status}).`
      );
      error.status = response.status;
      throw error;
    }

    return result;
  };

  const storeResponse = (response, currentSession = {}) => {
    const accessToken = getToken(response, [
      'access_token',
      'accessToken',
      'token',
      'jwt'
    ]);
    if (!accessToken) {
      throw new Error('Authentication did not return an access token.');
    }

    const session = {
      accessToken,
      refreshToken:
        getToken(response, ['refresh_token', 'refreshToken']) ||
        currentSession.refreshToken ||
        ''
    };
    storage?.setItem(CUSTOMER_SESSION_STORAGE_KEY, JSON.stringify(session));
    return session;
  };

  return {
    async registerCustomer({ fullName, companyName, email, password }) {
      return request('/v1/auth/customer/register', {
        method: 'POST',
        body: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          email: email.trim(),
          password
        }
      });
    },

    async login({ email, password }) {
      const response = await request('/v1/auth/customer/login', {
        method: 'POST',
        body: { email: email.trim(), password }
      });
      return storeResponse(response);
    },

    async refreshSession() {
      const session = getSession(storage);
      if (!session?.accessToken) {
        return null;
      }

      if (!isTokenExpired(session.accessToken)) {
        return session;
      }

      if (!session.refreshToken) {
        storage?.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
        return null;
      }

      try {
        const response = await request('/v1/auth/refresh', {
          method: 'POST',
          body: { refresh_token: session.refreshToken }
        });
        return storeResponse(response, session);
      } catch (error) {
        storage?.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
        if (error.status === 401 || error.status === 403) {
          return null;
        }
        throw error;
      }
    },

    async logout() {
      const session = getSession(storage);
      try {
        if (session?.accessToken) {
          await request('/v1/auth/logout', {
            method: 'POST',
            token: session.accessToken,
            body: session.refreshToken
              ? { refresh_token: session.refreshToken }
              : {}
          });
        }
      } finally {
        storage?.removeItem(CUSTOMER_SESSION_STORAGE_KEY);
      }
    }
  };
}
