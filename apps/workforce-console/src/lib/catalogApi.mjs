async function readResponse(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error?.message ||
        `Request failed (${response.status}).`
    );
  }

  return body;
}

function getList(body, keys) {
  if (Array.isArray(body)) {
    return body;
  }

  for (const value of [body, body?.data]) {
    if (Array.isArray(value)) {
      return value;
    }

    for (const key of keys) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }
  }

  return [];
}

function getEmployee(body) {
  return body?.employee ?? body?.data?.employee ?? body?.data ?? body;
}

function createHeaders(jwt) {
  return {
    Accept: 'application/json',
    Authorization: 'Bearer ' + jwt
  };
}

export async function fetchCatalog({ jwt, fetchImpl = fetch }) {
  const body = await readResponse(
    await fetchImpl('/v1/catalog', {
      headers: createHeaders(jwt)
    })
  );

  return getList(body, ['templates', 'items']);
}

export async function fetchEmployees({ jwt, fetchImpl = fetch }) {
  const body = await readResponse(
    await fetchImpl('/v1/employees', {
      headers: createHeaders(jwt)
    })
  );

  return getList(body, ['employees', 'items']);
}

export async function createEmployee({
  jwt,
  templateId,
  displayName,
  fetchImpl = fetch
}) {
  const body = {
    templateId,
    ...(displayName?.trim() ? { displayName: displayName.trim() } : {})
  };
  const response = await fetchImpl('/v1/employees', {
    method: 'POST',
    headers: {
      ...createHeaders(jwt),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const result = getEmployee(await readResponse(response));
  const employeeId = result?.id ?? result?.employeeId;

  if (!employeeId) {
    throw new Error('The hire succeeded but no employee ID was returned.');
  }

  return {
    ...result,
    id: employeeId
  };
}

export async function fetchEmployee({ jwt, employeeId, fetchImpl = fetch }) {
  const body = await readResponse(
    await fetchImpl(`/v1/employees/${encodeURIComponent(employeeId)}`, {
      headers: createHeaders(jwt)
    })
  );

  return getEmployee(body);
}
