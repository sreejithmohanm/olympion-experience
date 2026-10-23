import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchEmployeeWork, submitEmployeeWork } from './workApi.mjs';

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body
  };
}

test('fetchEmployeeWork requests authenticated history for the encoded employee', async () => {
  let request;
  const items = [{ id: 'work-1', output: 'Finished' }];
  const result = await fetchEmployeeWork({
    jwt: 'session-token',
    employeeId: 'employee/1',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return response({ data: { workItems: items } });
    }
  });

  assert.equal(request.url, '/v1/employees/employee%2F1/work');
  assert.equal(
    request.options.headers.Authorization,
    'Bearer ' + 'session-token'
  );
  assert.deepEqual(result, items);
});

test('submitEmployeeWork posts a prompt and dispatches SSE events across chunk boundaries', async () => {
  let request;
  const events = [];
  const encoder = new TextEncoder();
  const chunks = [
    'event: token\r\ndata: {"text":"Hello"}\r\n\r\n',
    'event: tool_call\ndata: {"name":"search","input":{"q":"Olympion"}}\n\n',
    'event: token\ndata: world\n\n'
  ];

  await submitEmployeeWork({
    jwt: 'session-token',
    employeeId: 'employee/1',
    prompt: 'Say hello',
    onEvent: (event) => events.push(event),
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          }
        })
      };
    }
  });

  assert.equal(request.url, '/v1/employees/employee%2F1/work');
  assert.equal(request.options.method, 'POST');
  assert.equal(
    request.options.headers.Authorization,
    'Bearer ' + 'session-token'
  );
  assert.equal(request.options.headers.Accept, 'text/event-stream');
  assert.deepEqual(JSON.parse(request.options.body), { prompt: 'Say hello' });
  assert.deepEqual(events, [
    { event: 'token', data: '{"text":"Hello"}' },
    {
      event: 'tool_call',
      data: '{"name":"search","input":{"q":"Olympion"}}'
    },
    { event: 'token', data: 'world' }
  ]);
});

test('work requests surface API errors', async () => {
  await assert.rejects(
    fetchEmployeeWork({
      jwt: 'session-token',
      employeeId: 'employee-1',
      fetchImpl: async () =>
        response({ message: 'History unavailable' }, { ok: false, status: 503 })
    }),
    /History unavailable/
  );

  await assert.rejects(
    submitEmployeeWork({
      jwt: 'session-token',
      employeeId: 'employee-1',
      prompt: 'Do work',
      onEvent() {},
      fetchImpl: async () =>
        response(
          { message: 'Employee is unavailable' },
          { ok: false, status: 409 }
        )
    }),
    /Employee is unavailable/
  );
});
