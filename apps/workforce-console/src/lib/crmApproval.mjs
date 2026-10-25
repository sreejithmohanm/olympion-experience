import { createHmac, randomUUID } from 'node:crypto';

export const REGISTRATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
});

export const CRM_ADMIN_ROLE = 'olympion-crm-admin';
export const DEFAULT_JWT_TTL_SECONDS = 60 * 60;

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

export function signJwt(payload, secret) {
  if (!secret) {
    throw new Error('A JWT signing secret is required.');
  }

  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function normalizeEmail(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

function assertAdmin(actor) {
  if (actor?.role !== CRM_ADMIN_ROLE) {
    throw new Error('Only an Olympion CRM Admin can perform this action.');
  }
}

function issueUserJwt({ tenant, user, secret, ttlSeconds, nowMs }) {
  const iat = Math.floor(nowMs / 1000);
  return signJwt(
    {
      sub: user.id,
      email: user.email,
      tenantId: tenant.id,
      customerId: tenant.customerId,
      iat,
      exp: iat + ttlSeconds
    },
    secret
  );
}

/**
 * In-memory CRM store. Customers register (pending), a CRM admin approves,
 * which creates a tenant and a JWT for the registering user. A customer may
 * have many users, each with their own JWT scoped to the customer's tenant.
 */
export function createCrmStore({
  jwtSecret,
  ttlSeconds = DEFAULT_JWT_TTL_SECONDS,
  now = () => Date.now()
} = {}) {
  const registrations = new Map();
  const customers = new Map();
  const tenants = new Map();

  function registerCustomer({ companyName, contactEmail, contactName }) {
    const email = normalizeEmail(contactEmail);
    if (!companyName?.trim() || !email) {
      throw new Error('Company name and contact email are required.');
    }

    const duplicate = [...registrations.values()].some(
      (item) =>
        item.contactEmail === email &&
        item.status !== REGISTRATION_STATUS.REJECTED
    );
    if (duplicate) {
      throw new Error('A registration for this email already exists.');
    }

    const registration = {
      id: `reg-${randomUUID()}`,
      companyName: companyName.trim(),
      contactName: contactName?.trim() ?? '',
      contactEmail: email,
      status: REGISTRATION_STATUS.PENDING,
      createdAt: new Date(now()).toISOString()
    };
    registrations.set(registration.id, registration);
    return { ...registration };
  }

  function listRegistrations(actor, status) {
    assertAdmin(actor);
    return [...registrations.values()]
      .filter((item) => !status || item.status === status)
      .map((item) => ({ ...item }));
  }

  function getPendingRegistration(registrationId) {
    const registration = registrations.get(registrationId);
    if (!registration) {
      throw new Error('Registration not found.');
    }
    if (registration.status !== REGISTRATION_STATUS.PENDING) {
      throw new Error(`Registration is already ${registration.status}.`);
    }
    return registration;
  }

  function approveRegistration(actor, registrationId) {
    assertAdmin(actor);
    const registration = getPendingRegistration(registrationId);
    const nowMs = now();

    const customer = {
      id: `cust-${randomUUID()}`,
      name: registration.companyName,
      registrationId: registration.id,
      userIds: []
    };
    const tenant = {
      id: `tenant-${randomUUID()}`,
      customerId: customer.id,
      createdAt: new Date(nowMs).toISOString()
    };
    customer.tenantId = tenant.id;
    customer.users = [];

    const user = {
      id: `user-${randomUUID()}`,
      customerId: customer.id,
      email: registration.contactEmail,
      name: registration.contactName
    };
    customer.users.push(user);
    customer.userIds.push(user.id);

    registration.status = REGISTRATION_STATUS.APPROVED;
    registration.approvedBy = actor.id ?? null;
    registration.decidedAt = new Date(nowMs).toISOString();
    registration.customerId = customer.id;

    customers.set(customer.id, customer);
    tenants.set(tenant.id, tenant);

    return {
      customer: { ...customer, users: [...customer.users] },
      tenant: { ...tenant },
      user: { ...user },
      jwt: issueUserJwt({ tenant, user, secret: jwtSecret, ttlSeconds, nowMs })
    };
  }

  function rejectRegistration(actor, registrationId, reason = '') {
    assertAdmin(actor);
    const registration = getPendingRegistration(registrationId);
    registration.status = REGISTRATION_STATUS.REJECTED;
    registration.rejectionReason = reason;
    registration.approvedBy = actor.id ?? null;
    registration.decidedAt = new Date(now()).toISOString();
    return { ...registration };
  }

  function addCustomerUser(actor, customerId, { email, name = '' }) {
    assertAdmin(actor);
    const customer = customers.get(customerId);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    const normalized = normalizeEmail(email);
    if (!normalized) {
      throw new Error('User email is required.');
    }
    if (customer.users.some((item) => item.email === normalized)) {
      throw new Error('User already belongs to this customer.');
    }

    const user = {
      id: `user-${randomUUID()}`,
      customerId,
      email: normalized,
      name
    };
    customer.users.push(user);
    customer.userIds.push(user.id);

    return {
      user: { ...user },
      jwt: issueUserJwt({
        tenant: tenants.get(customer.tenantId),
        user,
        secret: jwtSecret,
        ttlSeconds,
        nowMs: now()
      })
    };
  }

  function issueJwtForUser(customerId, userId) {
    const customer = customers.get(customerId);
    const user = customer?.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error('User not found.');
    }

    return issueUserJwt({
      tenant: tenants.get(customer.tenantId),
      user,
      secret: jwtSecret,
      ttlSeconds,
      nowMs: now()
    });
  }

  return {
    registerCustomer,
    listRegistrations,
    approveRegistration,
    rejectRegistration,
    addCustomerUser,
    issueJwtForUser
  };
}
