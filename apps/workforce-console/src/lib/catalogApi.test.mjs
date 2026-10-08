import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmployee,
  fetchCatalog,
  fetchEmployee,
  fetchEmployees
} from './catalogApi.mjs';

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body
  };
}

test('fetchCatalog and fetchEmployees use the authenticated API and unwrap lists', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return response(
      url === '/v1/catalog'
        ? { data: { templates: [{ id: 'template-1' }] } }
        : { data: [{ id: 'employee-1' }] }
    );
  };

  assert.deepEqual(await fetchCatalog({ jwt: 'session-token', fetchImpl }), [
    { id: 'template-1' }
  ]);
  assert.deepEqual(await fetchEmployees({ jwt: 'session-token', fetchImpl }), [
    { id: 'employee-1' }
  ]);
  assert.deepEqual(
    requests.map(({ url, options }) => [url, options.headers.Authorization]),
    [
      ['/v1/catalog', 'Bearer ' + 'session-token'],
      ['/v1/employees', 'Bearer ' + 'session-token']
    ]
  );
});

test('createEmployee sends the template and optional trimmed display name', async () => {
  let request;
  const employee = await createEmployee({
    jwt: 'session-token',
    templateId: 'template-1',
    displayName: '  Custom name  ',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response(
        { data: { employee: { id: 'employee-1' } } },
        { status: 201 }
      );
    }
  });

  assert.equal(employee.id, 'employee-1');
  assert.equal(request.url, '/v1/employees');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), {
    templateId: 'template-1',
    displayName: 'Custom name'
  });

  await createEmployee({
    jwt: 'session-token',
    templateId: 'template-2',
    displayName: ' ',
    fetchImpl: async (_url, options) => {
      assert.deepEqual(JSON.parse(options.body), { templateId: 'template-2' });
      return response({ id: 'employee-2' }, { status: 201 });
    }
  });
});

test('employee API errors are surfaced and details use a safely encoded ID', async () => {
  await assert.rejects(
    fetchCatalog({
      jwt: 'session-token',
      fetchImpl: async () =>
        response(
          { message: 'Catalog unavailable' },
          {
            ok: false,
            status: 503
          }
        )
    }),
    /Catalog unavailable/
  );

  let requestedUrl;
  const employee = await fetchEmployee({
    jwt: 'session-token',
    employeeId: 'employee/1',
    fetchImpl: async (url) => {
      requestedUrl = url;
      return response({ data: { id: 'employee/1', name: 'Ari' } });
    }
  });

  assert.equal(requestedUrl, '/v1/employees/employee%2F1');
  assert.equal(employee.name, 'Ari');
});
