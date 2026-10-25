'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  approveContact,
  fetchPendingContacts,
  rejectContact
} from '../../../lib/crmApproval.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isCrmAdmin,
  isJwtExpired
} from '../../../lib/workforceConsole.mjs';

function getContactId(contact) {
  return String(contact.contact_id ?? contact.contactId ?? contact.id ?? '');
}

export default function RegistrationsAdminPage() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setContacts(await fetchPendingContacts({ jwt: getStoredJwt() }));
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load registrations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const jwt = getStoredJwt();
    if (!jwt || isJwtExpired(jwt)) {
      if (jwt) {
        clearStoredJwt();
      }
      const redirect = `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
      globalThis.window.location.assign(
        `/?redirect=${encodeURIComponent(redirect)}`
      );
      setIsChecking(false);
      return;
    }
    setIsAuthorized(isCrmAdmin(jwt));
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      void load();
    }
  }, [isAuthorized, load]);

  const decide = async (contactId, action) => {
    setBusyId(contactId);
    setError('');
    try {
      await action({ jwt: getStoredJwt(), contactId });
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this registration.');
    } finally {
      setBusyId('');
    }
  };

  if (isChecking) {
    return (
      <main aria-busy="true">
        <p role="status">Checking administrator access…</p>
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main>
        <section className="panel">
          <h1>Customer registrations</h1>
          <p role="alert">
            Only Olympion CRM administrators can review registrations.
          </p>
          <a href="/employees">Back to employees</a>
        </section>
      </main>
    );
  }

  return (
    <main className="grid">
      <section className="panel">
        <a href="/employees">← Back to employees</a>
        <h1>Customer registrations</h1>
        <p className="muted">Approve or reject pending customer contacts.</p>
      </section>
      {error ? <p role="alert">{error}</p> : null}
      <section className="panel stack">
        {isLoading ? <p role="status">Loading registrations…</p> : null}
        {!isLoading && contacts.length === 0 ? (
          <p className="muted">No pending registrations.</p>
        ) : null}
        {contacts.map((contact) => {
          const id = getContactId(contact);
          return (
            <div className="card" key={id}>
              <strong>
                {contact.full_name ?? contact.fullName ?? contact.email}
              </strong>
              <p>
                {contact.email} · {contact.tenant_id ?? contact.tenantId ?? '—'}
              </p>
              <div className="employee-actions">
                <button
                  disabled={busyId === id}
                  onClick={() => void decide(id, approveContact)}
                  type="button"
                >
                  Approve
                </button>
                <button
                  className="secondary"
                  disabled={busyId === id}
                  onClick={() => void decide(id, rejectContact)}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
