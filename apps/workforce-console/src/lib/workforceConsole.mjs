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
    id: `work-${Date.now()}`,
    employeeId,
    employeeName: employee.name,
    prompt,
    output: '',
    status: 'streaming',
    tokens,
    createdAt: new Date().toISOString()
  };
}
