'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { createCustomerAuth } from '../lib/customerAuth.mjs';

export default function MarketplaceAuthGuard({
  children
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;
    const auth = createCustomerAuth();

    async function checkSession() {
      const hadSession = Boolean(
        window.sessionStorage.getItem('olympion.customer.session')
      );
      try {
        const session = await auth.refreshSession();
        if (!active) {
          return;
        }

        if (session) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
          const query = new URLSearchParams({
            next: pathname || '/marketplace'
          });
          if (hadSession) {
            query.set('expired', '1');
          }
          router.replace(`/login?${query.toString()}`);
        }
      } catch {
        if (active) {
          setAuthenticated(false);
          router.replace(
            `/login?${new URLSearchParams({
              next: pathname || '/marketplace'
            }).toString()}`
          );
        }
      } finally {
        if (active) {
          setChecked(true);
        }
      }
    }

    void checkSession();
    const interval = window.setInterval(() => {
      void checkSession();
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [pathname, router]);

  async function signOut() {
    await createCustomerAuth()
      .logout()
      .catch(() => {});
    router.replace('/login');
  }

  if (!checked || !authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f5f2] text-sm text-black/60">
        Checking your session…
      </main>
    );
  }

  return (
    <>
      <div className="flex justify-end border-b border-black/10 bg-white px-6 py-2">
        <button
          type="button"
          onClick={signOut}
          className="text-xs font-medium underline underline-offset-4"
        >
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
