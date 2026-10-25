export const REGISTRATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
});

export const CRM_ADMIN_ROLE = 'olympion-crm-admin';

const CONTACTS_URL = '/v1/auth/contacts';

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

function headers(jwt, hasBody = false) {
  return {
    Accept: 'application/json',
    Authorization: 'Bearer ' + jwt,
    ...(hasBody ? { 'Content-Type': 'application/json' } : {})
  };
}

export async function fetchPendingContacts({
  jwt,
  status = REGISTRATION_STATUS.PENDING,
  fetchImpl = fetch
}) {
  const body = await readResponse(
    await fetchImpl(`${CONTACTS_URL}?status=${encodeURIComponent(status)}`, {
      headers: headers(jwt)
    })
  );
  for (const value of [body, body?.data]) {
    if (Array.isArray(value)) {
      return value;
    }
    for (const key of ['contacts', 'items']) {
      if (Array.isArray(value?.[key])) {
        return value[key];
      }
    }
  }
  return [];
}

export async function updateContactStatus({
  jwt,
  contactId,
  status,
  fetchImpl = fetch
}) {
  if (
    ![REGISTRATION_STATUS.APPROVED, REGISTRATION_STATUS.REJECTED].includes(
      status
    )
  ) {
    throw new Error('Status must be approved or rejected.');
  }
  return readResponse(
    await fetchImpl(`${CONTACTS_URL}/${encodeURIComponent(contactId)}/status`, {
      method: 'PATCH',
      headers: headers(jwt, true),
      body: JSON.stringify({ status })
    })
  );
}

export const approveContact = (options) =>
  updateContactStatus({ ...options, status: REGISTRATION_STATUS.APPROVED });

export const rejectContact = (options) =>
  updateContactStatus({ ...options, status: REGISTRATION_STATUS.REJECTED });
