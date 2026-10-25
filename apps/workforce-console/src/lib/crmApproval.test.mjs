import test from 'node:test';
import assert from 'node:assert/strict';
import { CRM_ADMIN_ROLE, createCrmStore } from './crmApproval.mjs';
import { decodeJwtPayload } from './workforceConsole.mjs';

const admin = { id: 'admin-1', role: CRM_ADMIN_ROLE };

function setup() {
  const store = createCrmStore({ jwtSecret: 'secret' });
  const registration = store.registerCustomer({
    companyName: 'Acme',
    contactEmail: 'Boss@Acme.com',
    contactName: 'Boss'
  });
  return { store, registration };
}

test('registration is pending and does not create a tenant or JWT', () => {
  const { store, registration } = setup();
  assert.equal(registration.status, 'pending');
  assert.equal(store.listRegistrations(admin, 'pending').length, 1);
  assert.throws(() =>
    store.registerCustomer({
      companyName: 'Acme',
      contactEmail: 'boss@acme.com'
    })
  );
});

test('only CRM admin can approve', () => {
  const { store, registration } = setup();
  assert.throws(
    () => store.approveRegistration({ role: 'user' }, registration.id),
    /CRM Admin/
  );
});

test('approval creates tenant and JWT scoped to it', () => {
  const { store, registration } = setup();
  const result = store.approveRegistration(admin, registration.id);
  const payload = decodeJwtPayload(result.jwt);

  assert.equal(payload.tenantId, result.tenant.id);
  assert.equal(payload.customerId, result.customer.id);
  assert.equal(payload.email, 'boss@acme.com');
  assert.throws(() => store.approveRegistration(admin, registration.id));
});

test('a customer can have multiple users each with their own JWT', () => {
  const { store, registration } = setup();
  const first = store.approveRegistration(admin, registration.id);
  const second = store.addCustomerUser(admin, first.customer.id, {
    email: 'dev@acme.com'
  });

  const a = decodeJwtPayload(first.jwt);
  const b = decodeJwtPayload(second.jwt);
  assert.notEqual(a.sub, b.sub);
  assert.equal(a.tenantId, b.tenantId);
  assert.throws(() =>
    store.addCustomerUser(admin, first.customer.id, { email: 'DEV@acme.com' })
  );
});

test('rejected registration yields no tenant', () => {
  const { store, registration } = setup();
  const rejected = store.rejectRegistration(admin, registration.id, 'no');
  assert.equal(rejected.status, 'rejected');
  assert.throws(() => store.approveRegistration(admin, registration.id));
});
