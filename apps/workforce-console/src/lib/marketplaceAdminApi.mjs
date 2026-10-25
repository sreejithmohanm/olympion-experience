async function readResponse(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.detail ||
        body?.error?.message ||
        `Request failed (${response.status}).`
    );
  }

  return body;
}

function getListing(body) {
  return body?.listing ?? body?.data?.listing ?? body?.data ?? body;
}

function getList(body, keys) {
  for (const value of [body, body?.data]) {
    if (Array.isArray(value)) {
      return value;
    }
    for (const key of keys) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }
  }
  return [];
}

function createHeaders(jwt, hasBody = false) {
  return {
    Accept: 'application/json',
    Authorization: 'Bearer ' + jwt,
    ...(hasBody ? { 'Content-Type': 'application/json' } : {})
  };
}

function listingUrl(listingId = '') {
  const base = '/v1/admin/marketplace/listings';
  return listingId ? `${base}/${encodeURIComponent(listingId)}` : base;
}

export async function fetchMarketplaceListings({ jwt, fetchImpl = fetch }) {
  const body = await readResponse(
    await fetchImpl(listingUrl(), { headers: createHeaders(jwt) })
  );
  return getList(body, ['listings', 'employees', 'items']);
}

export async function updateMarketplaceListing({
  jwt,
  listingId,
  metadata,
  fetchImpl = fetch
}) {
  const body = await readResponse(
    await fetchImpl(listingUrl(listingId), {
      method: 'PATCH',
      headers: createHeaders(jwt, true),
      body: JSON.stringify(metadata)
    })
  );
  return getListing(body);
}

export async function setMarketplaceListingPublished({
  jwt,
  listingId,
  published,
  fetchImpl = fetch
}) {
  const action = published ? 'publish' : 'unpublish';
  const body = await readResponse(
    await fetchImpl(`${listingUrl(listingId)}/${action}`, {
      method: 'POST',
      headers: createHeaders(jwt, true),
      body: JSON.stringify({})
    })
  );
  return getListing(body);
}

export async function fetchMarketplaceListingAudit({
  jwt,
  listingId,
  fetchImpl = fetch
}) {
  const body = await readResponse(
    await fetchImpl(`${listingUrl(listingId)}/audit`, {
      headers: createHeaders(jwt)
    })
  );
  return getList(body, ['audit', 'events', 'items']);
}
