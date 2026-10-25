import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchMarketplaceListingAudit,
  fetchMarketplaceListings,
  setMarketplaceListingPublished,
  updateMarketplaceListing
} from './marketplaceAdminApi.mjs';

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body
  };
}

test('marketplace listing requests authenticate and unwrap API responses', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/audit')) {
      return response({ data: { events: [{ id: 'event-1' }] } });
    }
    return response({ data: { listings: [{ id: 'listing-1' }] } });
  };

  assert.deepEqual(
    await fetchMarketplaceListings({ jwt: 'admin-token', fetchImpl }),
    [{ id: 'listing-1' }]
  );
  assert.deepEqual(
    await fetchMarketplaceListingAudit({
      jwt: 'admin-token',
      listingId: 'listing/1',
      fetchImpl
    }),
    [{ id: 'event-1' }]
  );
  assert.equal(
    requests[0].options.headers.Authorization,
    'Bearer ' + 'admin-token'
  );
  assert.equal(
    requests[1].url,
    '/v1/admin/marketplace/listings/listing%2F1/audit'
  );
});

test('listing updates and publish actions send authenticated mutations', async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return response({
      data: { listing: { id: 'listing-1', published: true } }
    });
  };
  const metadata = {
    displayName: 'Ari Architect',
    description: 'Architecture services',
    availability: 'available'
  };

  await updateMarketplaceListing({
    jwt: 'admin-token',
    listingId: 'listing-1',
    metadata,
    fetchImpl
  });
  await setMarketplaceListingPublished({
    jwt: 'admin-token',
    listingId: 'listing-1',
    published: true,
    fetchImpl
  });
  await setMarketplaceListingPublished({
    jwt: 'admin-token',
    listingId: 'listing-1',
    published: false,
    fetchImpl
  });

  assert.equal(requests[0].options.method, 'PATCH');
  assert.deepEqual(JSON.parse(requests[0].options.body), metadata);
  assert.equal(
    requests[1].url,
    '/v1/admin/marketplace/listings/listing-1/publish'
  );
  assert.equal(
    requests[2].url,
    '/v1/admin/marketplace/listings/listing-1/unpublish'
  );
  assert.ok(
    requests.every(
      ({ options }) =>
        options.headers.Authorization === 'Bearer ' + 'admin-token'
    )
  );
});

test('marketplace listing API errors are surfaced', async () => {
  await assert.rejects(
    fetchMarketplaceListings({
      jwt: 'admin-token',
      fetchImpl: async () =>
        response(
          { detail: 'Admin access required.' },
          { ok: false, status: 403 }
        )
    }),
    /Admin access required/
  );
});
