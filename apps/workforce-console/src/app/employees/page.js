'use client';

import { useEffect, useState } from 'react';
import {
  fetchEmployee,
  fetchEmployees,
  terminateEmployee
} from '../../lib/catalogApi.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isJwtExpired
} from '../../lib/workforceConsole.mjs';

function getEmployeeName(employee) {
  return (
    employee.displayName ??
    employee.display_name ??
    employee.name ??
    'Digital Professional'
  );
}

function getEmployeeId(employee) {
  return employee.id ?? employee.employeeId ?? employee.employee_id;
}

function getEmployeeStatus(employee) {
  const status = String(employee.status ?? 'unknown').toLowerCase();

  if (status === 'active' || status === 'idle') {
    return { label: 'Active', className: 'active' };
  }
  if (status === 'working' || status === 'busy' || status === 'processing') {
    return { label: 'Working', className: 'working' };
  }
  if (status === 'error' || status === 'failed') {
    return { label: 'Error', className: 'error' };
  }
  if (status === 'terminated') {
    return { label: 'Terminated', className: 'terminated' };
  }

  return {
    label: status.replace(/[_-]/g, ' '),
    className: 'unknown'
  };
}

function getLastActive(employee) {
  const lastActive =
    employee.lastActiveAt ??
    employee.last_active_at ??
    employee.lastActive ??
    employee.last_active ??
    employee.lastSeenAt ??
    employee.last_seen_at;

  if (!lastActive) {
    return '—';
  }

  const date = new Date(lastActive);
  return Number.isNaN(date.getTime())
    ? String(lastActive)
    : date.toLocaleString();
}

export default function EmployeeDetailPage() {
  const [routeEmployeeId, setRouteEmployeeId] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [terminatingEmployeeId, setTerminatingEmployeeId] = useState('');

  useEffect(() => {
    const employeeId = new URLSearchParams(
      globalThis.window.location.search
    ).get('id');
    setRouteEmployeeId(employeeId || '');
    const jwt = getStoredJwt();

    if (!jwt || isJwtExpired(jwt)) {
      if (jwt) {
        clearStoredJwt();
      }
      const redirect = `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
      globalThis.window.location.assign(
        `/?redirect=${encodeURIComponent(redirect)}`
      );
      return;
    }

    let isMounted = true;
    const loadEmployees = (isFirst = false) =>
      fetchEmployees({ jwt })
        .then((result) => {
          if (isMounted) {
            setEmployees(result);
            setError('');
          }
        })
        .catch((requestError) => {
          if (isMounted) {
            setError(requestError.message || 'Unable to load employees.');
          }
        })
        .finally(() => {
          if (isMounted && isFirst) {
            setIsInitialLoad(false);
          }
        });

    if (employeeId) {
      fetchEmployee({ jwt, employeeId })
        .then((result) => {
          if (isMounted) {
            setEmployee(result);
          }
        })
        .catch((requestError) => {
          if (isMounted) {
            setError(requestError.message || 'Unable to load this employee.');
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsInitialLoad(false);
          }
        });
      loadEmployees(true);
      const refreshInterval = setInterval(() => loadEmployees(false), 10_000);

      return () => {
        isMounted = false;
        clearInterval(refreshInterval);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTerminate = async (employeeId) => {
    const employeeToTerminate = employees.find(
      (item) => getEmployeeId(item) === employeeId
    );
    if (
      !employeeToTerminate ||
      !globalThis.window.confirm(
        `Terminate ${getEmployeeName(employeeToTerminate)}?`
      )
    ) {
      return;
    }

    setTerminatingEmployeeId(employeeId);
    setError('');
    try {
      await terminateEmployee({ jwt: getStoredJwt(), employeeId });
      setEmployees((currentEmployees) =>
        currentEmployees.map((item) =>
          getEmployeeId(item) === employeeId
            ? { ...item, status: 'terminated' }
            : item
        )
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to terminate this employee.');
    } finally {
      setTerminatingEmployeeId('');
    }
  };

  if (routeEmployeeId === null) {
    return (
      <main aria-busy="true">
        <p role="status">Loading employees…</p>
      </main>
    );
  }

  if (!routeEmployeeId) {
    return (
      <main className="grid">
        <section className="panel">
          <h1>Employees</h1>
          <p className="muted">Your employees and their current status.</p>
        </section>
        {isInitialLoad ? <p role="status">Loading employees…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!isInitialLoad && !error && employees.length === 0 ? (
          <p className="muted">No employees found.</p>
        ) : null}
        {employees.map((item) => {
          const status = getEmployeeStatus(item);
          const employeeId = getEmployeeId(item);

          return (
            <article className="panel employee-row" key={employeeId}>
              <div>
                <h2>
                  <a href={`/employees?id=${encodeURIComponent(employeeId)}`}>
                    {getEmployeeName(item)}
                  </a>
                </h2>
                <p>
                  <strong>Role:</strong> {item.role || item.title || '—'}
                </p>
                <p>
                  <strong>Last active:</strong> {getLastActive(item)}
                </p>
              </div>
              <div className="employee-actions">
                <span className={`status-badge status-${status.className}`}>
                  {status.className === 'working' ? (
                    <span aria-hidden="true" className="status-spinner" />
                  ) : null}
                  {status.label}
                </span>
                {status.className !== 'terminated' ? (
                  <button
                    className="secondary"
                    disabled={
                      !employeeId || terminatingEmployeeId === employeeId
                    }
                    onClick={() => handleTerminate(employeeId)}
                    type="button"
                  >
                    {terminatingEmployeeId === employeeId
                      ? 'Terminating…'
                      : 'Terminate'}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </main>
    );
  }

  return (
    <main>
      <section className="panel stack">
        <a href="/employees">← Back to employees</a>
        {isInitialLoad ? <p role="status">Loading employee…</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {employee ? (
          <>
            <h1>
              {employee.displayName ||
                employee.display_name ||
                employee.name ||
                'Digital Professional'}
            </h1>
            <p>
              <strong>Role:</strong> {employee.role || '—'}
            </p>
            <p>
              <strong>Domain:</strong> {employee.domain || '—'}
            </p>
            {employee.description ? <p>{employee.description}</p> : null}
            <p className="muted">Employee ID: {employee.id}</p>
          </>
        ) : null}
      </section>
    </main>
  );
}
