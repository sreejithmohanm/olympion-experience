export const EMPLOYEE_CATALOG = [
  {
    id: 'architect-01',
    name: 'Ari Architect',
    specialty: 'Solution Architecture'
  },
  {
    id: 'analyst-01',
    name: 'Nia Analyst',
    specialty: 'Data Analysis'
  },
  {
    id: 'writer-01',
    name: 'Kai Writer',
    specialty: 'Technical Writing'
  }
];

export const SESSION_JWT_STORAGE_KEY = 'workforce-console.jwt';
export const INVALID_API_KEY_ERROR_MESSAGE =
  'Invalid API key. Please check your key and try again.';
export const SESSION_EXPIRED_ERROR_MESSAGE =
  'Your session expired. Please sign in again.';

function createWorkId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `work-${globalThis.crypto.randomUUID()}`;
  }

  return `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hireEmployee(hiredEmployees, employee) {
  if (hiredEmployees.some((current) => current.id === employee.id)) {
    return hiredEmployees;
  }

  return [
    ...hiredEmployees,
    {
      ...employee,
      status: 'idle'
    }
  ];
}

export function setEmployeeStatus(hiredEmployees, employeeId, status) {
  return hiredEmployees.map((employee) =>
    employee.id === employeeId
      ? {
          ...employee,
          status
        }
      : employee
  );
}

export function getIdleEmployees(hiredEmployees) {
  return hiredEmployees.filter((employee) => employee.status === 'idle');
}

export function canAssignWork({
  hiredEmployees,
  selectedEmployeeId,
  prompt,
  hasStreamingWork
}) {
  if (hasStreamingWork || !selectedEmployeeId || !prompt.trim()) {
    return false;
  }

  return hiredEmployees.some(
    (employee) =>
      employee.id === selectedEmployeeId && employee.status === 'idle'
  );
}

export function tokenizeResponse(prompt, employeeName) {
  const summary = `${employeeName} received your request: "${prompt}". Preparing output stream.`;
  return summary.split(' ');
}

export function createWorkItem({ employeeId, prompt, hiredEmployees }) {
  const employee = hiredEmployees.find((item) => item.id === employeeId);

  if (!employee) {
    throw new Error('Employee is required to assign work.');
  }

  const tokens = tokenizeResponse(prompt, employee.name);

  return {
    id: createWorkId(),
    employeeId,
    employeeName: employee.name,
    prompt,
    output: '',
    status: 'streaming',
    tokens,
    createdAt: new Date().toISOString()
  };
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(padded);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0)
    );
    if (typeof globalThis.TextDecoder === 'function') {
      return new TextDecoder().decode(bytes);
    }

    return Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  }

  return Buffer.from(padded, 'base64').toString('utf8');
}

export function decodeJwtPayload(jwt) {
  if (!jwt || typeof jwt !== 'string') {
    return null;
  }

  const [, encodedPayload] = jwt.split('.');

  if (!encodedPayload) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    return null;
  }
}

export function isJwtExpired(jwt, nowMs = Date.now()) {
  const payload = decodeJwtPayload(jwt);
  if (!payload) {
    return true;
  }

  if (typeof payload.exp !== 'number') {
    return false;
  }

  return payload.exp * 1000 <= nowMs;
}

function getStorage(storage) {
  return storage ?? globalThis.sessionStorage;
}

export function getStoredJwt(storage) {
  const activeStorage = getStorage(storage);
  if (!activeStorage) {
    return '';
  }

  return activeStorage.getItem(SESSION_JWT_STORAGE_KEY) ?? '';
}

export function storeJwt(jwt, storage) {
  const activeStorage = getStorage(storage);
  if (!activeStorage) {
    return;
  }

  activeStorage.setItem(SESSION_JWT_STORAGE_KEY, jwt);
}

export function clearStoredJwt(storage) {
  const activeStorage = getStorage(storage);
  if (!activeStorage) {
    return;
  }

  activeStorage.removeItem(SESSION_JWT_STORAGE_KEY);
}

function isInvalidApiKeyError(error) {
  const message = String(error?.message ?? '').toLowerCase();
  return (
    error?.code === 'INVALID_API_KEY' ||
    error?.status === 401 ||
    error?.status === 403 ||
    message.includes('invalid api key') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  );
}

export function extractJwtToken(response) {
  if (typeof response === 'string') {
    return response;
  }

  if (!response || typeof response !== 'object') {
    return '';
  }

  const candidate =
    response.jwt ??
    response.token ??
    response.accessToken ??
    response.data?.jwt ??
    response.data?.token ??
    response.data?.accessToken ??
    '';

  return typeof candidate === 'string' ? candidate : '';
}

export async function exchangeApiKeyForJwt({ apiKey, sdk }) {
  const trimmedApiKey = apiKey?.trim();
  if (!trimmedApiKey) {
    throw new Error(INVALID_API_KEY_ERROR_MESSAGE);
  }

  const authScope = sdk?.auth ?? sdk;
  const authMethodName = [
    'exchangeApiKeyForJwt',
    'loginWithApiKey',
    'authenticateWithApiKey',
    'signInWithApiKey'
  ].find((method) => typeof authScope?.[method] === 'function');

  if (!authMethodName) {
    throw new Error('SDK authentication method is not available.');
  }

  try {
    const response = await authScope[authMethodName](trimmedApiKey);
    const jwt = extractJwtToken(response);

    if (!jwt) {
      throw new Error('Authentication did not return a JWT.');
    }

    return jwt;
  } catch (error) {
    if (isInvalidApiKeyError(error)) {
      throw new Error(INVALID_API_KEY_ERROR_MESSAGE);
    }

    throw error;
  }
}
