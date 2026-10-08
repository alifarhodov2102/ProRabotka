'use client';

import {
  useEffect,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  useEffect(() => {
    const token =
      localStorage.getItem(
        'prorabotka_token',
      );

    if (
      !token &&
      pathname !== '/login' &&
      pathname !== '/register'
    ) {
      router.replace(
        '/login',
      );
    }
  }, [
    pathname,
    router,
  ]);

  return <>{children}</>;
}