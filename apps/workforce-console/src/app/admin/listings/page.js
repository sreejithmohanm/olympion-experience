'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchMarketplaceListingAudit,
  fetchMarketplaceListings,
  setMarketplaceListingPublished,
  updateMarketplaceListing
} from '../../../lib/marketplaceAdminApi.mjs';
import {
  clearStoredJwt,
  getStoredJwt,
  isJwtExpired,
  isWorkforceAdmin
} from '../../../lib/workforceConsole.mjs';

function getListingId(listing) {
  return String(
    listing.id ??
      listing.listingId ??
      listing.listing_id ??
      listing.employeeId ??
      listing.employee_id ??
      ''
  );
}

function getListingName(listing) {
  return (
    listing.displayName ??
    listing.display_name ??
    listing.name ??
    listing.title ??
    'Digital Professional'
  );
}

function isPublished(listing) {
  const value =
    listing.published ??
    listing.isPublished ??
    listing.is_published ??
    listing.publishStatus ??
    listing.publish_status ??
    listing.status;
  if (typeof value === 'boolean') {
    return value;
  }
  return ['true', 'published', 'live'].includes(String(value).toLowerCase());
}

function getAvailability(listing) {
  if (typeof listing.available === 'boolean') {
    return listing.available ? 'available' : 'unavailable';
  }
  if (typeof listing.is_available === 'boolean') {
    return listing.is_available ? 'available' : 'unavailable';
  }
  const value =
    listing.availability ??
    listing.availabilityStatus ??
    listing.availability_status ??
    'available';
  return String(value).toLowerCase() === 'available'
    ? 'available'
    : 'unavailable';
}

function getAuditEntries(body) {
  return Array.isArray(body) ? body : [];
}

export default function MarketplaceListingsAdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [listings, setListings] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [auditEntries, setAuditEntries] = useState([]);
  const [form, setForm] = useState({
    displayName: '',
    role: '',
    description: '',
    domain: '',
    availability: 'available'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const selectedIdRef = useRef(selectedId);

  const selectedListing = listings.find(
    (listing) => getListingId(listing) === selectedId
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

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
      setIsCheckingAccess(false);
      return;
    }

    setIsAuthorized(isWorkforceAdmin(jwt));
    setIsCheckingAccess(false);
  }, []);

  useEffect(() => {
    if (!isAuthorized) {
      return undefined;
    }

    let active = true;
    let live = false;
    const refresh = async () => {
      try {
        const result = await fetchMarketplaceListings({ jwt: getStoredJwt() });
        if (active) {
          setListings(result);
          setSelectedId((current) => {
            if (
              current &&
              result.some((item) => getListingId(item) === current)
            ) {
              return current;
            }
            return getListingId(result[0] ?? {});
          });
          setError('');
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || 'Unable to load marketplace listings.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    const refreshLiveData = async () => {
      await refresh();
      const listingId = selectedIdRef.current;
      if (!listingId) {
        return;
      }
      try {
        const audit = await fetchMarketplaceListingAudit({
          jwt: getStoredJwt(),
          listingId
        });
        if (active) {
          setAuditEntries(getAuditEntries(audit));
        }
      } catch {
        // Keep the current audit trail visible if a live refresh fails.
      }
    };

    const source = new globalThis.EventSource(
      '/v1/marketplace/employees/events'
    );
    const refreshEvents = [
      'created',
      'updated',
      'published',
      'unpublished',
      'deleted',
      'marketplace.employee.created',
      'marketplace.employee.updated',
      'marketplace.employee.published',
      'marketplace.employee.unpublished',
      'marketplace.employee.deleted'
    ];
    source.onopen = () => {
      live = true;
      if (active) {
        setIsLive(true);
      }
    };
    source.onerror = () => {
      live = false;
      if (active) {
        setIsLive(false);
      }
    };
    refreshEvents.forEach((name) =>
      source.addEventListener(name, () => void refreshLiveData())
    );
    source.onmessage = () => void refreshLiveData();
    void refresh();
    const refreshInterval = setInterval(() => {
      if (!live) {
        void refresh();
      }
    }, 15_000);

    return () => {
      active = false;
      live = false;
      source.close();
      clearInterval(refreshInterval);
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized || !selectedId) {
      setAuditEntries([]);
      return undefined;
    }

    let active = true;
    fetchMarketplaceListingAudit({ jwt: getStoredJwt(), listingId: selectedId })
      .then((result) => {
        if (active) {
          setAuditEntries(getAuditEntries(result));
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Unable to load the audit trail.');
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthorized, selectedId]);

  useEffect(() => {
    if (!selectedListing || isFormDirty) {
      return;
    }

    setForm({
      displayName: getListingName(selectedListing),
      role: selectedListing.role ?? selectedListing.title ?? '',
      description: selectedListing.description ?? '',
      domain: selectedListing.domain ?? '',
      availability: getAvailability(selectedListing)
    });
  }, [isFormDirty, selectedListing]);

  const refreshSelectedListing = async () => {
    const result = await fetchMarketplaceListings({ jwt: getStoredJwt() });
    setListings(result);
    const updated = result.find((item) => getListingId(item) === selectedId);
    if (updated) {
      setForm({
        displayName: getListingName(updated),
        role: updated.role ?? updated.title ?? '',
        description: updated.description ?? '',
        domain: updated.domain ?? '',
        availability: getAvailability(updated)
      });
    }
    const audit = await fetchMarketplaceListingAudit({
      jwt: getStoredJwt(),
      listingId: selectedId
    });
    setAuditEntries(getAuditEntries(audit));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      await updateMarketplaceListing({
        jwt: getStoredJwt(),
        listingId: selectedId,
        metadata: form
      });
      setIsFormDirty(false);
      await refreshSelectedListing();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update this listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (published) => {
    setIsSaving(true);
    setError('');
    try {
      await setMarketplaceListingPublished({
        jwt: getStoredJwt(),
        listingId: selectedId,
        published
      });
      await refreshSelectedListing();
    } catch (requestError) {
      setError(
        requestError.message ||
          `Unable to ${published ? 'publish' : 'unpublish'} this listing.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAccess) {
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
          <h1>Marketplace listings</h1>
          <p role="alert">Only workforce administrators can manage listings.</p>
          <a href="/employees">Back to employees</a>
        </section>
      </main>
    );
  }

  return (
    <main className="grid">
      <section className="panel">
        <a href="/employees">← Back to employees</a>
        <h1>Marketplace listings</h1>
        <p className="muted">
          Manage employee listing details, availability, and publication status.
        </p>
        <p aria-live="polite" className="muted">
          {isLive
            ? 'Live marketplace updates connected'
            : 'Marketplace updates reconnecting; checking periodically'}
        </p>
      </section>
      {error ? <p role="alert">{error}</p> : null}
      <section className="grid two">
        <div className="panel">
          <h2>Listings</h2>
          {isLoading ? <p role="status">Loading listings…</p> : null}
          {!isLoading && listings.length === 0 ? (
            <p className="muted">No marketplace listings found.</p>
          ) : null}
          <div className="stack">
            {listings.map((listing) => {
              const listingId = getListingId(listing);
              const published = isPublished(listing);
              return (
                <button
                  aria-pressed={listingId === selectedId}
                  className="secondary"
                  key={listingId}
                  onClick={() => {
                    if (listingId !== selectedId) {
                      setIsFormDirty(false);
                      setSelectedId(listingId);
                    }
                  }}
                  type="button"
                >
                  <strong>{getListingName(listing)}</strong>
                  <br />
                  <span>
                    {published ? 'Published' : 'Unpublished'} ·{' '}
                    {getAvailability(listing)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {selectedListing ? (
          <div className="panel stack">
            <div>
              <h2>{getListingName(selectedListing)}</h2>
              <p>
                Marketplace status:{' '}
                <strong>
                  {isPublished(selectedListing) ? 'Published' : 'Unpublished'}
                </strong>
              </p>
              <p>
                Availability:{' '}
                <strong>{getAvailability(selectedListing)}</strong>
              </p>
            </div>
            <form className="stack" onSubmit={handleSave}>
              <div>
                <label htmlFor="listing-name">Display name</label>
                <input
                  id="listing-name"
                  onChange={(event) => {
                    setIsFormDirty(true);
                    setForm((current) => ({
                      ...current,
                      displayName: event.target.value
                    }));
                  }}
                  required
                  value={form.displayName}
                />
              </div>
              <div>
                <label htmlFor="listing-role">Role</label>
                <input
                  id="listing-role"
                  onChange={(event) => {
                    setIsFormDirty(true);
                    setForm((current) => ({
                      ...current,
                      role: event.target.value
                    }));
                  }}
                  value={form.role}
                />
              </div>
              <div>
                <label htmlFor="listing-domain">Domain</label>
                <input
                  id="listing-domain"
                  onChange={(event) => {
                    setIsFormDirty(true);
                    setForm((current) => ({
                      ...current,
                      domain: event.target.value
                    }));
                  }}
                  value={form.domain}
                />
              </div>
              <div>
                <label htmlFor="listing-description">Description</label>
                <textarea
                  id="listing-description"
                  onChange={(event) => {
                    setIsFormDirty(true);
                    setForm((current) => ({
                      ...current,
                      description: event.target.value
                    }));
                  }}
                  rows={4}
                  value={form.description}
                />
              </div>
              <div>
                <label htmlFor="listing-availability">Availability</label>
                <select
                  id="listing-availability"
                  onChange={(event) => {
                    setIsFormDirty(true);
                    setForm((current) => ({
                      ...current,
                      availability: event.target.value
                    }));
                  }}
                  value={form.availability}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <button disabled={isSaving || !selectedId} type="submit">
                {isSaving ? 'Saving…' : 'Save listing'}
              </button>
            </form>
            <div className="employee-actions">
              {isPublished(selectedListing) ? (
                <button
                  className="secondary"
                  disabled={isSaving}
                  onClick={() => void handlePublish(false)}
                  type="button"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  disabled={isSaving}
                  onClick={() => void handlePublish(true)}
                  type="button"
                >
                  Publish
                </button>
              )}
            </div>
          </div>
        ) : null}
      </section>
      <section className="panel">
        <h2>Audit trail</h2>
        {!selectedId ? (
          <p className="muted">Select a listing to view its history.</p>
        ) : null}
        {selectedId && auditEntries.length === 0 ? (
          <p className="muted">No audit events found.</p>
        ) : null}
        <ol className="stack">
          {auditEntries.map((entry, index) => (
            <li className="card" key={entry.id ?? entry.eventId ?? index}>
              <strong>
                {entry.action ?? entry.event ?? 'Listing updated'}
              </strong>
              <p>
                {entry.actor?.name ??
                  entry.actor?.email ??
                  entry.actor?.id ??
                  entry.actorName ??
                  'Administrator'}
                {' · '}
                {entry.timestamp ?? entry.createdAt ?? entry.created_at ?? '—'}
              </p>
              {entry.reason ? <p>{entry.reason}</p> : null}
              {entry.previousValue || entry.newValue ? (
                <p className="muted">
                  {JSON.stringify(entry.previousValue ?? null)} →{' '}
                  {JSON.stringify(entry.newValue ?? null)}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
