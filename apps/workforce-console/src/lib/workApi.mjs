import { workforceApiUrl } from './workforceApi.mjs';

function createHeaders(jwt) {
  return {
    Accept: 'application/json',
    Authorization: 'Bearer ' + jwt
  };
}

async function getErrorMessage(response) {
  try {
    const body = await response.json();
    return (
      body?.message ||
      body?.error?.message ||
      `Request failed (${response.status}).`
    );
  } catch {
    return `Request failed (${response.status}).`;
  }
}

function getWorkItems(body) {
  for (const value of [body, body?.data]) {
    if (Array.isArray(value)) {
      return value;
    }

    for (const key of ['workItems', 'work_items', 'items']) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }
  }

  return [];
}

function dispatchEvent(block, onEvent) {
  if (!block) {
    return;
  }

  let event = 'message';
  const data = [];

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    const separator = line.indexOf(':');
    const field = separator === -1 ? line : line.slice(0, separator);
    const value =
      separator === -1 ? '' : line.slice(separator + 1).replace(/^ /, '');

    if (field === 'event') {
      event = value;
    } else if (field === 'data') {
      data.push(value);
    }
  }

  if (data.length > 0) {
    onEvent({ event, data: data.join('\n') });
  }
}

export async function fetchEmployeeWork({
  jwt,
  employeeId,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    workforceApiUrl(`/v1/employees/${encodeURIComponent(employeeId)}/work`),
    { headers: createHeaders(jwt) }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return getWorkItems(await response.json());
}

export async function submitEmployeeWork({
  jwt,
  employeeId,
  prompt,
  onEvent,
  signal,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    workforceApiUrl(`/v1/employees/${encodeURIComponent(employeeId)}/work`),
    {
      method: 'POST',
      headers: {
        ...createHeaders(jwt),
        Accept: 'text/event-stream',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt }),
      signal
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
  if (!response.body) {
    throw new Error('The work stream is unavailable.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  try {
    while (!done) {
      const result = await reader.read();
      done = result.done;
      const { value } = result;
      buffer += decoder.decode(value, { stream: !done });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? '';
      blocks.forEach((block) => dispatchEvent(block, onEvent));
    }
    dispatchEvent(buffer, onEvent);
  } finally {
    reader.releaseLock();
  }
}
