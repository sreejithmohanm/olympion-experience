'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  createCustomerAuth,
  SESSION_EXPIRED_MESSAGE
} from '../lib/customerAuth.mjs';

export default function CustomerAuthForm({
  mode,
  expired = false
}: {
  mode: 'login' | 'signup';
  expired?: boolean;
}) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const [error, setError] = useState(expired ? SESSION_EXPIRED_MESSAGE : '');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const auth = createCustomerAuth();
    try {
      if (isSignup) {
        await auth.registerCustomer({
          fullName: String(form.get('fullName') ?? ''),
          companyName: String(form.get('companyName') ?? ''),
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? '')
        });
        setPending(true);
      } else {
        await auth.login({
          email: String(form.get('email') ?? ''),
          password: String(form.get('password') ?? '')
        });
        const params = new URLSearchParams(window.location.search);
        const destination = params.get('next');
        let safeDestination = '/marketplace';
        if (destination?.startsWith('/') && !destination.startsWith('//')) {
          try {
            const target = new URL(destination, window.location.origin);
            if (target.origin === window.location.origin) {
              safeDestination = `${target.pathname}${target.search}${target.hash}`;
            }
          } catch {
            safeDestination = '/marketplace';
          }
        }
        router.replace(safeDestination);
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Please try again.';
      const status = (requestError as { status?: number } | null)?.status;
      setError(
        !isSignup && (status === 403 || /pending|approval/i.test(message))
          ? 'Your account is awaiting approval by an Olympion CRM administrator.'
          : message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f2] px-5 py-12 text-[#171717]">
      <section className="w-full max-w-md border border-black/10 bg-white p-8 sm:p-10">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Olympion
        </Link>
        {pending ? (
          <>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight">
              Request received
            </h1>
            <p className="mt-4 leading-7 text-black/65">
              Your customer registration is pending approval by an Olympion CRM
              administrator. You can sign in once your account is approved.
            </p>
            <Link
              href="/login"
              className="mt-7 inline-block bg-[#f6cf42] px-5 py-3 text-sm font-semibold"
            >
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-8 text-3xl font-semibold tracking-tight">
              {isSignup ? 'Create a customer account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-black/60">
              {isSignup
                ? 'Register to request access to the Olympion marketplace.'
                : 'Sign in to continue to the marketplace.'}
            </p>
            {error && (
              <p
                role="alert"
                className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                {error}
              </p>
            )}
            <form onSubmit={submit} className="mt-7 space-y-4">
              {isSignup && (
                <>
                  <label className="block text-sm font-medium">
                    Full name
                    <input
                      required
                      name="fullName"
                      autoComplete="name"
                      className="mt-1 block w-full border border-black/20 px-3 py-2.5 font-normal outline-none focus:border-black"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Company
                    <input
                      required
                      name="companyName"
                      autoComplete="organization"
                      className="mt-1 block w-full border border-black/20 px-3 py-2.5 font-normal outline-none focus:border-black"
                    />
                  </label>
                </>
              )}
              <label className="block text-sm font-medium">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="mt-1 block w-full border border-black/20 px-3 py-2.5 font-normal outline-none focus:border-black"
                />
              </label>
              <label className="block text-sm font-medium">
                Password
                <input
                  required
                  type="password"
                  name="password"
                  minLength={8}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className="mt-1 block w-full border border-black/20 px-3 py-2.5 font-normal outline-none focus:border-black"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#f6cf42] px-5 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {loading
                  ? 'Please wait…'
                  : isSignup
                    ? 'Request marketplace access'
                    : 'Sign in'}
              </button>
            </form>
            <p className="mt-6 text-sm text-black/60">
              {isSignup ? 'Already registered?' : 'New to Olympion?'}{' '}
              <Link
                href={isSignup ? '/login' : '/signup'}
                className="font-semibold text-black underline underline-offset-4"
              >
                {isSignup ? 'Sign in' : 'Register'}
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
