'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createCustomerAuth } from '../lib/customerAuth.mjs';
import {
  fetchMarketplaceEmployee,
  hireMarketplaceEmployee
} from '../lib/marketplaceApi.mjs';

type Employee = {
  id?: string;
  employeeId?: string;
  employee_id?: string;
  name?: string;
  displayName?: string;
  display_name?: string;
  full_name?: string;
  role?: string;
  title?: string;
  seniority?: string;
  description?: string;
  domain?: string;
  skills?: (string | { name?: string; skill?: string })[];
  available?: boolean | string;
  is_available?: boolean;
  availability?: string;
  availability_status?: string;
  status?: string;
};

function employeeName(employee: Employee) {
  return (
    employee.displayName ??
    employee.display_name ??
    employee.full_name ??
    employee.name ??
    'Digital Professional'
  );
}

function isAvailable(employee: Employee) {
  if (typeof employee.available === 'boolean') {
    return employee.available;
  }
  if (typeof employee.is_available === 'boolean') {
    return employee.is_available;
  }
  const status = String(
    employee.available ??
      employee.availability ??
      employee.availability_status ??
      employee.status ??
      ''
  ).toLowerCase();
  return !status || status === 'available' || status === 'published';
}

export default function MarketplaceEmployeeDetails() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadedId, setLoadedId] = useState('');
  const loading = loadedId !== employeeId;
  const [error, setError] = useState('');
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMarketplaceEmployee({ employeeId })
      .then((result) => {
        if (active) {
          setEmployee(result ?? null);
          setError('');
          if (!result) {
            setError('This professional is no longer available.');
          }
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this professional.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoadedId(employeeId);
        }
      });

    return () => {
      active = false;
    };
  }, [employeeId]);

  async function handleHire() {
    setError('');
    try {
      const session = await createCustomerAuth().refreshSession();
      if (!session) {
        const next = `/marketplace/employees/${encodeURIComponent(employeeId)}`;
        router.push(`/login?${new URLSearchParams({ next }).toString()}`);
        return;
      }
      setHiring(true);
      await hireMarketplaceEmployee({ jwt: session.accessToken, employeeId });
      router.push('/account/employees');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to hire this professional.'
      );
    } finally {
      setHiring(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-6 py-12 text-[#171717]">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium underline underline-offset-4"
          href="/marketplace"
        >
          ← Back to marketplace
        </Link>
        {loading ? (
          <p className="py-16 text-sm text-black/60" role="status">
            Loading professional…
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
        {employee ? (
          <article className="mt-8 border border-black/10 bg-white p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
              Professional profile
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {employeeName(employee)}
            </h1>
            <p className="mt-2 text-lg text-black/65">
              {employee.role ?? employee.title ?? 'Professional'}
              {employee.seniority ? ` · ${employee.seniority}` : ''}
            </p>
            {employee.domain ? (
              <p className="mt-3 text-sm text-black/60">
                Domain: {employee.domain}
              </p>
            ) : null}
            {employee.description ? (
              <p className="mt-6 leading-7 text-black/75">
                {employee.description}
              </p>
            ) : null}
            {Array.isArray(employee.skills) && employee.skills.length > 0 ? (
              <section aria-label="Skills" className="mt-8">
                <h2 className="text-sm font-semibold">Skills</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {employee.skills.map((skill) => {
                    const label =
                      typeof skill === 'string'
                        ? skill
                        : (skill.name ?? skill.skill);
                    return label ? (
                      <li
                        className="border border-black/10 px-3 py-1.5 text-sm text-black/65"
                        key={label}
                      >
                        {label}
                      </li>
                    ) : null;
                  })}
                </ul>
              </section>
            ) : null}
            <p className="mt-8 flex items-center gap-2 text-sm">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${isAvailable(employee) ? 'bg-[#4d815b]' : 'bg-black/25'}`}
              />
              {isAvailable(employee)
                ? 'Available now'
                : 'Not currently available'}
            </p>
            <button
              className="mt-7 bg-[#f6cf42] px-5 py-3 text-sm font-semibold disabled:opacity-50"
              disabled={!isAvailable(employee) || hiring}
              onClick={() => void handleHire()}
              type="button"
            >
              {hiring ? 'Hiring…' : 'Hire this professional'}
            </button>
          </article>
        ) : null}
      </div>
    </main>
  );
}
