'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createCustomerAuth } from '../lib/customerAuth.mjs';
import {
  fetchHiredEmployees,
  fetchMarketplaceEmployees,
  hireMarketplaceEmployee,
  marketplaceApiUrl
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
  skills?: (string | { name?: string; skill?: string })[];
  available?: boolean | string;
  is_available?: boolean;
  availability?: string;
  availability_status?: string;
  status?: string;
};

function employeeId(employee: Employee) {
  return employee.id ?? employee.employeeId ?? employee.employee_id ?? '';
}

function employeeName(employee: Employee) {
  return (
    employee.displayName ??
    employee.display_name ??
    employee.full_name ??
    employee.name ??
    'Digital Professional'
  );
}

function employeeSkills(employee: Employee) {
  return Array.isArray(employee.skills)
    ? employee.skills
        .map((skill) =>
          typeof skill === 'string' ? skill : (skill.name ?? skill.skill ?? '')
        )
        .filter(Boolean)
    : [];
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

function EmployeeCard({
  employee,
  onHire,
  hiringId
}: {
  employee: Employee;
  onHire: (employee: Employee) => void;
  hiringId: string;
}) {
  const id = employeeId(employee);
  const available = isAvailable(employee);

  return (
    <article className="flex flex-col border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          {employee.seniority ? (
            <span className="inline-block rounded-sm bg-[#e8f0e8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3b764a]">
              {employee.seniority}
            </span>
          ) : null}
          <h2 className="mt-2 text-base font-semibold leading-tight">
            {employeeName(employee)}
          </h2>
          <p className="mt-1 text-sm text-black/60">
            {employee.role ?? employee.title ?? 'Professional'}
          </p>
        </div>
        <span
          aria-label={available ? 'Available' : 'Not available'}
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${available ? 'bg-[#4d815b]' : 'bg-black/20'}`}
          title={available ? 'Available' : 'Not available'}
        />
      </div>
      {employee.description ? (
        <p className="mt-3 text-sm leading-6 text-black/65">
          {employee.description}
        </p>
      ) : null}
      {employeeSkills(employee).length ? (
        <ul aria-label="Skills" className="mt-4 flex flex-wrap gap-1.5">
          {employeeSkills(employee).map((skill) => (
            <li
              className="border border-black/10 px-2 py-0.5 text-[11px] text-black/60"
              key={skill}
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex gap-2 border-t border-black/10 pt-4">
        <Link
          className="flex-1 border border-black/15 px-3 py-2 text-center text-xs font-medium"
          href={`/marketplace/employees/${encodeURIComponent(id)}`}
        >
          View profile
        </Link>
        <button
          className="flex-1 bg-[#f6cf42] px-3 py-2 text-xs font-semibold disabled:opacity-60"
          disabled={!available || !id || hiringId === id}
          onClick={() => onHire(employee)}
          type="button"
        >
          {hiringId === id ? 'Hiring…' : 'Hire'}
        </button>
      </div>
    </article>
  );
}

export default function MarketplaceExperience() {
  const router = useRouter();
  const refreshRef = useRef<() => void>(() => {});
  const connectedRef = useRef(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [skill, setSkill] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize, setPageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hireError, setHireError] = useState('');
  const [hiringId, setHiringId] = useState('');
  const [live, setLive] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [hired, setHired] = useState<Employee[]>([]);
  const [hiredError, setHiredError] = useState('');

  useEffect(() => {
    let active = true;
    fetchMarketplaceEmployees({
      search: search.trim(),
      role: role.trim(),
      skill: skill.trim(),
      availability,
      page,
      pageSize
    })
      .then((result) => {
        if (active) {
          setEmployees(result.employees);
          setTotal(result.total);
          setHasMore(result.hasMore);
          setPageSize(result.pageSize);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load marketplace employees.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [availability, page, pageSize, refreshKey, role, search, skill]);

  useEffect(() => {
    refreshRef.current = () => setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadHired() {
      try {
        const session = await createCustomerAuth().refreshSession();
        if (!active) {
          return;
        }
        setSignedIn(Boolean(session));
        if (!session) {
          setHired([]);
          return;
        }
        const result = await fetchHiredEmployees({ jwt: session.accessToken });
        if (active) {
          setHired(result);
          setHiredError('');
        }
      } catch (requestError) {
        if (active) {
          setHiredError(
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load your hired employees.'
          );
        }
      }
    }
    void loadHired();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let stopped = false;
    let reconnectTimer: number | undefined;
    let retryDelay = 1000;
    let source: EventSource | undefined;
    const update = () => refreshRef.current();
    const eventNames = [
      'created',
      'updated',
      'published',
      'unpublished',
      'deleted',
      'employee.created',
      'employee.updated',
      'employee.published',
      'employee.unpublished',
      'employee.deleted',
      'marketplace.employee.created',
      'marketplace.employee.updated',
      'marketplace.employee.published',
      'marketplace.employee.unpublished',
      'marketplace.employee.deleted'
    ];

    const connect = () => {
      if (stopped) {
        return;
      }
      source = new EventSource(
        marketplaceApiUrl('/v1/marketplace/employees/events')
      );
      source.onopen = () => {
        connectedRef.current = true;
        setLive(true);
        retryDelay = 1000;
      };
      source.onmessage = update;
      eventNames.forEach((name) => source?.addEventListener(name, update));
      source.onerror = () => {
        connectedRef.current = false;
        setLive(false);
        source?.close();
        if (!stopped) {
          reconnectTimer = window.setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30_000);
        }
      };
    };

    connect();
    const pollTimer = window.setInterval(() => {
      if (!connectedRef.current) {
        update();
      }
    }, 15_000);

    return () => {
      stopped = true;
      connectedRef.current = false;
      source?.close();
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      if (pollTimer) {
        window.clearInterval(pollTimer);
      }
    };
  }, []);

  async function handleHire(employee: Employee) {
    const id = employeeId(employee);
    if (!id) {
      return;
    }
    setHireError('');
    try {
      const session = await createCustomerAuth().refreshSession();
      if (!session) {
        const next = `/marketplace/employees/${encodeURIComponent(id)}`;
        router.push(`/login?${new URLSearchParams({ next }).toString()}`);
        return;
      }
      setHiringId(id);
      await hireMarketplaceEmployee({
        jwt: session.accessToken,
        employeeId: id
      });
      router.push('/account/employees');
    } catch (requestError) {
      setHireError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to hire this employee.'
      );
    } finally {
      setHiringId('');
    }
  }

  const pageCount =
    total === null
      ? page + Number(hasMore)
      : Math.max(1, Math.ceil(total / pageSize));

  function updateFilter(update: () => void) {
    setIsLoading(true);
    setError('');
    update();
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-[#171717]">
      <header className="bg-white">
        <div className="hidden h-[70px] border-b border-black/10 px-7 md:flex md:items-center md:justify-between">
          <p className="text-xs leading-4">
            Need an AI professional?
            <br />
            <strong className="font-medium">hello@olympion.ai</strong>
          </p>
          <Link
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2 text-[29px] font-semibold tracking-[-.06em]"
            href="/"
          >
            <span className="grid h-7 w-7 place-items-center rounded-sm bg-[#f6cf42]">
              ✳
            </span>
            Olympion
          </Link>
          <Link
            className="text-xs font-medium underline underline-offset-4"
            href="/account/employees"
          >
            My employees
          </Link>
        </div>
        <nav
          aria-label="Main navigation"
          className="flex min-h-[62px] items-center justify-center border-b border-black/10 px-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-5 py-3 text-sm sm:gap-8">
            <Link href="/products">Platform</Link>
            <Link className="font-medium" href="/marketplace">
              Marketplace
            </Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/about">Company</Link>
            {signedIn ? null : <Link href="/login">Sign in</Link>}
            <Link className="md:hidden" href="/account/employees">
              My employees
            </Link>
          </div>
        </nav>
      </header>

      <section className="product-grid border-b border-black/5">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="text-xs text-black/50">Home / Marketplace</p>
          <p className="mt-10 text-xs font-semibold uppercase tracking-[.17em] text-[#806400]">
            Olympion Marketplace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-.05em] sm:text-5xl lg:text-6xl">
            Browse professionals.
            <br />
            <span className="marker-highlight">Interview before you hire.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8">
            Explore roles, skills, and availability. Browse freely, then sign in
            with your customer account to hire.
          </p>
          <p aria-live="polite" className="mt-4 text-xs text-black/55">
            <span
              aria-hidden="true"
              className={`mr-2 inline-block h-2 w-2 rounded-full ${live ? 'bg-[#4d815b]' : 'bg-black/25'}`}
            />
            {live
              ? 'Live marketplace updates connected'
              : 'Marketplace updates reconnecting'}
          </p>
        </div>
      </section>

      {signedIn ? (
        <section
          aria-label="Your hired employees"
          className="mx-auto max-w-5xl px-6 pt-8"
        >
          <h2 className="text-xl font-medium tracking-tight">
            Your hired employees
          </h2>
          {hiredError ? (
            <p className="mt-3 text-sm text-red-800" role="alert">
              {hiredError}
            </p>
          ) : hired.length === 0 ? (
            <p className="mt-3 text-sm text-black/60">
              Your organisation has not hired anyone yet.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hired.map((employee, index) => (
                <article
                  className="border border-black/10 bg-white p-5"
                  key={employeeId(employee) || index}
                >
                  <h3 className="text-base font-semibold leading-tight">
                    {employeeName(employee)}
                  </h3>
                  <p className="mt-1 text-sm text-black/60">
                    {employee.role ?? employee.title ?? 'Professional'}
                  </p>
                  {employeeSkills(employee).length ? (
                    <ul
                      aria-label="Skills"
                      className="mt-3 flex flex-wrap gap-1.5"
                    >
                      {employeeSkills(employee).map((skill) => (
                        <li
                          className="border border-black/10 px-2 py-0.5 text-[11px] text-black/60"
                          key={skill}
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          <Link
            className="mt-4 inline-block text-xs font-medium underline underline-offset-4"
            href="/account/employees"
          >
            Manage my employees
          </Link>
        </section>
      ) : null}

      <section
        aria-label="Search and filter employees"
        className="mx-auto max-w-5xl px-6 py-8"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold">
            Search
            <input
              className="mt-1 block w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal"
              onChange={(event) =>
                updateFilter(() => setSearch(event.target.value))
              }
              placeholder="Name or keyword"
              type="search"
              value={search}
            />
          </label>
          <label className="text-xs font-semibold">
            Role
            <input
              className="mt-1 block w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal"
              onChange={(event) =>
                updateFilter(() => setRole(event.target.value))
              }
              placeholder="Any role"
              value={role}
            />
          </label>
          <label className="text-xs font-semibold">
            Skill
            <input
              className="mt-1 block w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal"
              onChange={(event) =>
                updateFilter(() => setSkill(event.target.value))
              }
              placeholder="Any skill"
              value={skill}
            />
          </label>
          <label className="text-xs font-semibold">
            Availability
            <select
              className="mt-1 block w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal"
              onChange={(event) =>
                updateFilter(() => setAvailability(event.target.value))
              }
              value={availability}
            >
              <option value="">Any availability</option>
              <option value="available">Available now</option>
              <option value="unavailable">Not available</option>
            </select>
          </label>
        </div>
        {hireError ? (
          <p
            className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            role="alert"
          >
            {hireError}
          </p>
        ) : null}
      </section>

      <section
        aria-label="Marketplace employees"
        aria-busy={isLoading}
        className="mx-auto max-w-5xl px-6 pb-16"
      >
        {isLoading ? (
          <p className="py-10 text-center text-sm text-black/60" role="status">
            Loading professionals…
          </p>
        ) : null}
        {error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
            <button
              className="mt-4 border border-black/20 bg-white px-4 py-2 text-sm"
              onClick={() => {
                setIsLoading(true);
                setError('');
                setRefreshKey((current) => current + 1);
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : null}
        {!isLoading && !error && employees.length === 0 ? (
          <p className="py-10 text-center text-sm text-black/60">
            No professionals match these filters.
          </p>
        ) : null}
        {!error && employees.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-black/55">
              <p>
                {total === null
                  ? `${(page - 1) * pageSize + employees.length}${hasMore ? '+' : ''} professionals`
                  : `${total} professionals`}
              </p>
              <p>
                Page {page} of {pageCount}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee, index) => (
                <EmployeeCard
                  employee={employee}
                  hiringId={hiringId}
                  key={employeeId(employee) || index}
                  onHire={handleHire}
                />
              ))}
            </div>
            <nav
              aria-label="Marketplace pages"
              className="mt-8 flex items-center justify-center gap-4"
            >
              <button
                className="border border-black/20 bg-white px-4 py-2 text-sm disabled:opacity-40"
                disabled={page <= 1 || isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => Math.max(1, current - 1));
                }}
                type="button"
              >
                Previous
              </button>
              <button
                className="border border-black/20 bg-white px-4 py-2 text-sm disabled:opacity-40"
                disabled={page >= pageCount || isLoading}
                onClick={() => {
                  setIsLoading(true);
                  setPage((current) => Math.min(pageCount, current + 1));
                }}
                type="button"
              >
                Next
              </button>
            </nav>
          </>
        ) : null}
      </section>

      <footer className="bg-[#171717] text-white">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 px-6 py-8 text-xs text-white/45 sm:flex-row">
          <span>© 2026 Olympion Inc.</span>
          <span>Platform · Marketplace · Pricing · Company</span>
        </div>
      </footer>
    </main>
  );
}
