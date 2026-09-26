import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPLOYEE_CATALOG,
  createWorkItem,
  hireEmployee,
  tokenizeResponse
} from './workforceConsole.mjs';

test('hireEmployee adds status only once per employee', () => {
  const firstHire = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const secondHire = hireEmployee(firstHire, EMPLOYEE_CATALOG[0]);

  assert.equal(firstHire.length, 1);
  assert.equal(firstHire[0].status, 'idle');
  assert.equal(secondHire.length, 1);
});

test('tokenizeResponse includes employee name and prompt content', () => {
  const tokens = tokenizeResponse('Draft a release note', 'Ari Architect');

  assert.ok(tokens.includes('Ari'));
  assert.ok(tokens.some((token) => token.includes('release')));
});

test('createWorkItem builds a streaming work item', () => {
  const hiredEmployees = hireEmployee([], EMPLOYEE_CATALOG[1]);
  const workItem = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[1].id,
    prompt: 'Summarize customer feedback',
    hiredEmployees
  });

  assert.equal(workItem.employeeName, EMPLOYEE_CATALOG[1].name);
  assert.equal(workItem.status, 'streaming');
  assert.ok(workItem.tokens.length > 0);
});

test('createWorkItem throws if employee is missing', () => {
  assert.throws(
    () =>
      createWorkItem({
        employeeId: 'missing',
        prompt: 'Hello',
        hiredEmployees: []
      }),
    /Employee is required/
  );
});
