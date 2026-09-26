import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAssignWork,
  EMPLOYEE_CATALOG,
  createWorkItem,
  getIdleEmployees,
  hireEmployee,
  setEmployeeStatus,
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
  assert.match(workItem.id, /^work-/);
  assert.ok(!Number.isNaN(Date.parse(workItem.createdAt)));
});

test('createWorkItem generates unique ids across multiple assignments', () => {
  const hiredEmployees = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const first = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[0].id,
    prompt: 'First prompt',
    hiredEmployees
  });
  const second = createWorkItem({
    employeeId: EMPLOYEE_CATALOG[0].id,
    prompt: 'Second prompt',
    hiredEmployees
  });

  assert.notEqual(first.id, second.id);
});

test('setEmployeeStatus updates busy/idle state and idle filtering', () => {
  const hired = hireEmployee([], EMPLOYEE_CATALOG[2]);
  const busyEmployees = setEmployeeStatus(hired, EMPLOYEE_CATALOG[2].id, 'busy');

  assert.equal(busyEmployees[0].status, 'busy');
  assert.equal(getIdleEmployees(busyEmployees).length, 0);

  const idleEmployees = setEmployeeStatus(busyEmployees, EMPLOYEE_CATALOG[2].id, 'idle');
  assert.equal(getIdleEmployees(idleEmployees).length, 1);
});

test('canAssignWork rejects non-idle employees and active streams', () => {
  const hired = hireEmployee([], EMPLOYEE_CATALOG[0]);
  const busy = setEmployeeStatus(hired, EMPLOYEE_CATALOG[0].id, 'busy');

  assert.equal(
    canAssignWork({
      hiredEmployees: busy,
      selectedEmployeeId: EMPLOYEE_CATALOG[0].id,
      prompt: 'Do work',
      hasStreamingWork: false
    }),
    false
  );

  assert.equal(
    canAssignWork({
      hiredEmployees: hired,
      selectedEmployeeId: EMPLOYEE_CATALOG[0].id,
      prompt: 'Do work',
      hasStreamingWork: true
    }),
    false
  );
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
