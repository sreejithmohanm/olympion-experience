'use client';

import { useEffect, useState } from 'react';
import { fetchEmployee } from '../../lib/catalogApi.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isJwtExpired
} from '../../lib/workforceConsole.mjs';

export default function EmployeeDetailPage() {
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const employeeId = new URLSearchParams(
      globalThis.window.location.search
    ).get('id');
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

    if (!employeeId) {
      setError('An employee ID is required to view this page.');
      setIsLoading(false);
      return;
    }

    fetchEmployee({ jwt, employeeId })
      .then(setEmployee)
      .catch((requestError) => {
        setError(requestError.message || 'Unable to load this employee.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main>
      <section className="panel stack">
        <a href="/catalog">← Back to catalog</a>
        {isLoading ? <p role="status">Loading employee…</p> : null}
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
