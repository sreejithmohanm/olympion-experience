'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createCustomerAuth } from '../lib/customerAuth.mjs';
import { fetchHiredEmployees } from '../lib/marketplaceApi.mjs';

type Employee = {
  id?: string;
  employeeId?: string;
  employee_id?: string;
  name?: string;
  displayName?: string;
  display_name?: string;
  full_name?: string;
  employee_name?: string;
  role?: string;
  title?: string;
  status?: string;
};

function employeeId(employee: Employee) {
  return employee.id ?? employee.employeeId ?? employee.employee_id ?? '';
}

function employeeName(employee: Employee) {
  return (
    employee.displayName ??
    employee.display_name ??
    employee.employee_name ??
    employee.full_name ??
    employee.name ??
    'Digital Professional'
  );
}

export default function CustomerEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadEmployees() {
      try {
        const session = await createCustomerAuth().refreshSession();
        if (!session) {
          throw new Error('Your session expired. Please sign in again.');
        }
        const result = await fetchHiredEmployees({ jwt: session.accessToken });
        if (active) {
          setEmployees(result);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your employees.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void loadEmployees();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Customer account
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              My employees
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Your hired Olympion professionals.
            </p>
          </div>
          <Link
            className="bg-[#f6cf42] px-4 py-2.5 text-sm font-semibold"
            href="/marketplace"
          >
            Browse marketplace
          </Link>
        </div>
        {loading ? (
          <p className="py-12 text-sm text-black/60" role="status">
            Loading your employees…
          </p>
        ) : null}
        {error ? (
          <p
            className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {!loading && !error && employees.length === 0 ? (
          <section className="mt-8 border border-black/10 bg-white p-8 text-center">
            <h2 className="font-semibold">No employees yet</h2>
            <p className="mt-2 text-sm text-black/60">
              Explore the marketplace to find a professional for your team.
            </p>
            <Link
              className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
              href="/marketplace"
            >
              Explore professionals
            </Link>
          </section>
        ) : null}
        {!loading && !error && employees.length > 0 ? (
          <section
            aria-label="Hired employees"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {employees.map((employee, index) => (
              <article
                className="border border-black/10 bg-white p-5"
                key={employeeId(employee) || index}
              >
                <h2 className="font-semibold">{employeeName(employee)}</h2>
                <p className="mt-1 text-sm text-black/60">
                  {employee.role ?? employee.title ?? 'Digital Professional'}
                </p>
                {employee.status ? (
                  <p className="mt-4 text-xs text-black/55">
                    Status: {employee.status}
                  </p>
                ) : null}
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
