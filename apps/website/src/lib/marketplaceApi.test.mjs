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

test('marketplace employee search sends filters and unwraps paginated results', async () => {
  let request;
  const result = await fetchMarketplaceEmployees({
    search: 'architect',
    role: 'Engineering',
    skill: 'TypeScript',
    availability: 'available',
    page: 2,
    pageSize: 6,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response({
        data: { employees: [{ id: 'employee-1' }] },
        pagination: { total: 13, page: 2, page_size: 6 }
      });
    }
  });

  const url = new URL(request.url, 'https://example.test');
  assert.equal(url.pathname, '/v1/marketplace/employees');
  assert.equal(url.searchParams.get('search'), 'architect');
  assert.equal(url.searchParams.get('role'), 'Engineering');
  assert.equal(url.searchParams.get('skill'), 'TypeScript');
  assert.equal(url.searchParams.get('availability'), 'available');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(url.searchParams.get('page_size'), '6');
  assert.equal(request.options.headers.Accept, 'application/json');
  assert.deepEqual(result, {
    employees: [{ id: 'employee-1' }],
    total: 13,
    hasMore: true,
    page: 2,
    pageSize: 6
  });
});

test('marketplace employee lists without pagination metadata paginate locally', async () => {
  const result = await fetchMarketplaceEmployees({
    page: 2,
    pageSize: 2,
    fetchImpl: async () =>
      response({
        employees: [
          { id: 'employee-1' },
          { id: 'employee-2' },
          { id: 'employee-3' }
        ]
      })
  });

  assert.deepEqual(result, {
    employees: [{ id: 'employee-3' }],
    total: 3,
    hasMore: false,
    page: 2,
    pageSize: 2
  });
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
    employeeId: 'employee/1',
    fetchImpl
  });

  assert.equal(requests[0].url, '/v1/employees');
  assert.equal(
    requests[0].options.headers.Authorization,
    'Bearer ' + 'customer-token'
  );
  assert.equal(requests[1].url, '/v1/marketplace/employees/employee%2F1/hire');
  assert.equal(requests[1].options.method, 'POST');
  assert.equal(
    requests[1].options.headers.Authorization,
    'Bearer ' + 'customer-token'
  );
});

test('marketplace employee details safely encode IDs and remain public', async () => {
  let request;
  const result = await fetchMarketplaceEmployee({
    employeeId: 'employee/1',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response({ data: { employee: { id: 'employee/1' } } });
    }
  });

  assert.equal(request.url, '/v1/marketplace/employees/employee%2F1');
  assert.deepEqual(request.options.headers, { Accept: 'application/json' });
  assert.deepEqual(result, { id: 'employee/1' });
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

  assert.equal(
    marketplaceApiUrl('/v1/marketplace/employees'),
    '/v1/marketplace/employees'
  );
});
