export const EMPLOYEE_CATALOG = [
  {
    id: 'architect-01',
    name: 'Ari Architect',
    specialty: 'Solution Architecture'
  },
  {
    id: 'analyst-01',
    name: 'Nia Analyst',
    specialty: 'Data Analysis'
  },
  {
    id: 'writer-01',
    name: 'Kai Writer',
    specialty: 'Technical Writing'
  }
];

function createWorkId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `work-${globalThis.crypto.randomUUID()}`;
  }

  return `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hireEmployee(hiredEmployees, employee) {
  if (hiredEmployees.some((current) => current.id === employee.id)) {
    return hiredEmployees;
  }

  return [
    ...hiredEmployees,
    {
      ...employee,
      status: 'idle'
    }
  ];
}

export function setEmployeeStatus(hiredEmployees, employeeId, status) {
  return hiredEmployees.map((employee) =>
    employee.id === employeeId
      ? {
          ...employee,
          status
        }
      : employee
  );
}

export function getIdleEmployees(hiredEmployees) {
  return hiredEmployees.filter((employee) => employee.status === 'idle');
}

export function canAssignWork({
  hiredEmployees,
  selectedEmployeeId,
  prompt,
  hasStreamingWork
}) {
  if (hasStreamingWork || !selectedEmployeeId || !prompt.trim()) {
    return false;
  }

  return hiredEmployees.some(
    (employee) => employee.id === selectedEmployeeId && employee.status === 'idle'
  );
}

export function tokenizeResponse(prompt, employeeName) {
  const summary = `${employeeName} received your request: "${prompt}". Preparing output stream.`;
  return summary.split(' ');
}

export function createWorkItem({ employeeId, prompt, hiredEmployees }) {
  const employee = hiredEmployees.find((item) => item.id === employeeId);

  if (!employee) {
    throw new Error('Employee is required to assign work.');
  }

  const tokens = tokenizeResponse(prompt, employee.name);

  return {
    id: createWorkId(),
    employeeId,
    employeeName: employee.name,
    prompt,
    output: '',
    status: 'streaming',
    tokens,
    createdAt: new Date().toISOString()
  };
}
