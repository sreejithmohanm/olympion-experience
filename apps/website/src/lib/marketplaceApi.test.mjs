import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fetchHiredEmployees,
  fetchMarketplaceEmployee,
  fetchMarketplaceEmployees,
  hireMarketplaceEmployee,
  marketplaceApiUrl
} from './marketplaceApi.mjs';

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body
  };
}

test('marketplace lists catalog templates publicly and filters/paginates locally', async () => {
  let request;
  const templates = [
    {
      id: 't1',
      role: 'Engineering',
      skills: ['TypeScript'],
      name: 'Architect'
    },
    { id: 't2', role: 'Design', skills: ['Figma'], name: 'Designer' },
    { id: 't3', role: 'Engineering', skills: ['Go'], status: 'retired' }
  ];
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return response({ data: { templates } });
  };

  const all = await fetchMarketplaceEmployees({ pageSize: 2, fetchImpl });
  assert.equal(request.url, '/v1/catalog');
  assert.deepEqual(request.options.headers, { Accept: 'application/json' });
  assert.deepEqual(all, {
    employees: templates.slice(0, 2),
    total: 3,
    hasMore: true,
    page: 1,
    pageSize: 2
  });

  const filtered = await fetchMarketplaceEmployees({
    role: 'engineering',
    skill: 'type',
    search: 'architect',
    fetchImpl
  });
  assert.deepEqual(filtered.employees, [templates[0]]);
});

test('catalog requests are tenant-scoped only when a JWT is supplied', async () => {
  const headers = [];
  const fetchImpl = async (url, options) => {
    headers.push(options.headers);
    return response({ templates: [] });
  };
  await fetchMarketplaceEmployees({ fetchImpl });
  await fetchMarketplaceEmployees({ jwt: 'customer-token', fetchImpl });
  assert.equal(headers[0].Authorization, undefined);
  assert.equal(headers[1].Authorization, 'Bearer customer-token');
});

test('hired employees and hire requests use customer authorization', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return response({ data: { employees: [{ id: 'employee/1' }] } });
  };

  assert.deepEqual(
    await fetchHiredEmployees({ jwt: 'customer-token', fetchImpl }),
    [{ id: 'employee/1' }]
  );
  await hireMarketplaceEmployee({
    jwt: 'customer-token',
    employeeId: 'template-1',
    fetchImpl
  });

  assert.equal(requests[0].url, '/v1/employees');
  assert.equal(
    requests[0].options.headers.Authorization,
    'Bearer ' + 'customer-token'
  );
  assert.equal(requests[1].url, '/v1/employees');
  assert.equal(requests[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    templateId: 'template-1'
  });
  assert.equal(
    requests[1].options.headers.Authorization,
    'Bearer ' + 'customer-token'
  );
});

test('marketplace template details are found in the public catalog', async () => {
  const fetchImpl = async () =>
    response({ templates: [{ id: 'a' }, { id: 'b' }] });
  assert.deepEqual(
    await fetchMarketplaceEmployee({ employeeId: 'b', fetchImpl }),
    { id: 'b' }
  );
  assert.equal(
    await fetchMarketplaceEmployee({ employeeId: 'z', fetchImpl }),
    null
  );
});

test('marketplace API errors retain their HTTP status and API base URL is normalized', async () => {
  await assert.rejects(
    fetchMarketplaceEmployees({
      fetchImpl: async () =>
        response(
          { detail: 'Marketplace unavailable' },
          { ok: false, status: 503 }
        )
    }),
    (error) =>
      error.message === 'Marketplace unavailable' && error.status === 503
  );

  assert.equal(marketplaceApiUrl('/v1/catalog'), '/v1/catalog');
});
