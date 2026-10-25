function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL ?? '').replace(
    /\/+$/,
    ''
  );
}

export function marketplaceApiUrl(path) {
  return `${apiBaseUrl()}${path}`;
}

async function readResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(
      body?.detail ||
        body?.message ||
        body?.error?.message ||
        `Request failed (${response.status}).`
    );
    error.status = response.status;
    throw error;
  }

  return body;
}

function getList(body, keys) {
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

function getPagination(body, employees, page, pageSize) {
  const meta = body?.pagination ?? body?.meta ?? body?.data?.pagination ?? {};
  const total =
    meta.total ?? meta.total_count ?? body?.total ?? body?.data?.total;
  const hasTotal =
    total !== undefined && total !== null && Number.isFinite(Number(total));
  if (!hasTotal && employees.length > pageSize) {
    return {
      employees: employees.slice((page - 1) * pageSize, page * pageSize),
      total: employees.length,
      hasMore: false,
      page,
      pageSize
    };
  }
  return {
    employees,
    total: hasTotal ? Number(total) : null,
    hasMore: hasTotal
      ? page * pageSize < Number(total)
      : employees.length >= pageSize,
    page: Number(meta.page ?? body?.page ?? page) || page,
    pageSize: Number(meta.page_size ?? meta.pageSize ?? pageSize) || pageSize
  };
}

export async function fetchMarketplaceEmployees({
  search = '',
  role = '',
  skill = '',
  availability = '',
  page = 1,
  pageSize = 12,
  fetchImpl = fetch
} = {}) {
  const query = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize)
  });
  for (const [key, value] of Object.entries({
    search,
    role,
    skill,
    availability
  })) {
    if (value) {
      query.set(key, value);
    }
  }

  const response = await fetchImpl(
    marketplaceApiUrl(`/v1/marketplace/employees?${query.toString()}`),
    { headers: { Accept: 'application/json' } }
  );
  const body = await readResponse(response);
  const employees = getList(body, ['employees', 'items', 'results']);
  return getPagination(body, employees, page, pageSize);
}

export async function fetchMarketplaceEmployee({
  employeeId,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    marketplaceApiUrl(
      `/v1/marketplace/employees/${encodeURIComponent(employeeId)}`
    ),
    { headers: { Accept: 'application/json' } }
  );
  const body = await readResponse(response);
  return body?.employee ?? body?.data?.employee ?? body?.data ?? body;
}

export async function fetchHiredEmployees({ jwt, fetchImpl = fetch }) {
  const response = await fetchImpl(marketplaceApiUrl('/v1/employees'), {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + jwt
    }
  });
  return getList(await readResponse(response), ['employees', 'items']);
}

export async function hireMarketplaceEmployee({
  jwt,
  employeeId,
  fetchImpl = fetch
}) {
  const response = await fetchImpl(
    marketplaceApiUrl(
      `/v1/marketplace/employees/${encodeURIComponent(employeeId)}/hire`
    ),
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + jwt
      }
    }
  );
  return (await readResponse(response)) ?? {};
}
