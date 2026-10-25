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

const CATALOG_PATH = '/v1/catalog';

function templateId(template) {
  return String(
    template?.id ?? template?.templateId ?? template?.template_id ?? ''
  );
}

function templateAvailable(template) {
  if (typeof template?.available === 'boolean') {
    return template.available;
  }
  if (typeof template?.is_available === 'boolean') {
    return template.is_available;
  }
  const status = String(
    template?.availability ??
      template?.availability_status ??
      template?.status ??
      ''
  ).toLowerCase();
  return !status || status === 'available' || status === 'published';
}

function templateText(template) {
  const skills = Array.isArray(template?.skills)
    ? template.skills.map((skill) =>
        typeof skill === 'string' ? skill : (skill?.name ?? skill?.skill ?? '')
      )
    : [];
  return { skills, role: String(template?.role ?? template?.title ?? '') };
}

// Without a JWT the catalog is the generic template list; with a customer JWT
// the request is tenant-scoped.
async function fetchCatalogTemplates(fetchImpl, jwt) {
  const response = await fetchImpl(marketplaceApiUrl(CATALOG_PATH), {
    headers: {
      Accept: 'application/json',
      ...(jwt ? { Authorization: 'Bearer ' + jwt } : {})
    }
  });
  return getList(await readResponse(response), ['templates', 'items']);
}

export async function fetchMarketplaceEmployees({
  search = '',
  role = '',
  skill = '',
  availability = '',
  page = 1,
  pageSize = 12,
  jwt = '',
  fetchImpl = fetch
} = {}) {
  const templates = await fetchCatalogTemplates(fetchImpl, jwt);
  const needle = search.trim().toLowerCase();
  const roleNeedle = role.trim().toLowerCase();
  const skillNeedle = skill.trim().toLowerCase();
  const filtered = templates.filter((template) => {
    const { skills, role: templateRole } = templateText(template);
    if (needle && !JSON.stringify(template).toLowerCase().includes(needle)) {
      return false;
    }
    if (roleNeedle && !templateRole.toLowerCase().includes(roleNeedle)) {
      return false;
    }
    if (
      skillNeedle &&
      !skills.some((name) => name.toLowerCase().includes(skillNeedle))
    ) {
      return false;
    }
    if (availability) {
      return templateAvailable(template) === (availability === 'available');
    }
    return true;
  });

  return {
    employees: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    hasMore: page * pageSize < filtered.length,
    page,
    pageSize
  };
}

export async function fetchMarketplaceEmployee({
  employeeId,
  jwt = '',
  fetchImpl = fetch
}) {
  const templates = await fetchCatalogTemplates(fetchImpl, jwt);
  return (
    templates.find((template) => templateId(template) === String(employeeId)) ??
    null
  );
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
  const response = await fetchImpl(marketplaceApiUrl('/v1/employees'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + jwt
    },
    body: JSON.stringify({ templateId: employeeId })
  });
  return (await readResponse(response)) ?? {};
}
