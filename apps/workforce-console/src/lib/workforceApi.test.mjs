import assert from 'node:assert/strict';
import test from 'node:test';
import { workforceApiUrl } from './workforceApi.mjs';

test('workforce API URLs use the configured base and trim trailing slashes', () => {
  const previousBaseUrl = process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL;
  process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL =
    'https://workforce.example.test///';

  try {
    assert.equal(
      workforceApiUrl('/v1/catalog'),
      'https://workforce.example.test/v1/catalog'
    );
  } finally {
    if (previousBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL = previousBaseUrl;
    }
  }
});

test('workforce API URLs default to same-origin routes', () => {
  const previousBaseUrl = process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL;
  delete process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL;

  try {
    assert.equal(workforceApiUrl('/v1/catalog'), '/v1/catalog');
  } finally {
    if (previousBaseUrl !== undefined) {
      process.env.NEXT_PUBLIC_WORKFORCE_OS_API_BASE_URL = previousBaseUrl;
    }
  }
});
