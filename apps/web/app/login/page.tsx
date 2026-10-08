'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  LockKeyhole,
  Mail,
} from 'lucide-react';

import ThemeToggle from '@/components/theme-toggle';
import ProRabotkaLogo from '@/components/prorabotka-logo';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,
              }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        const message =
          Array.isArray(
            data?.message,
          )
            ? data.message.join(
                ', ',
              )
            : data?.message ||
              'Unable to sign in';

        throw new Error(
          message,
        );
      }

      localStorage.setItem(
        'prorabotka_token',
        data.accessToken,
      );

      localStorage.setItem(
        'prorabotka_user',
        JSON.stringify(
          data.user,
        ),
      );

      router.push(
        '/dashboard',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-[#f7f8fa] px-6 dark:bg-slate-950">
      <div className="fixed right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col items-center justify-center py-10">
        <div className="mb-8 flex justify-center">
          <ProRabotkaLogo className="h-11 w-[205px]" />
        </div>

        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Sign in
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter your account
                details to continue.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>

                <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-500">
                  <Mail
                    size={16}
                    className="shrink-0 text-slate-400 dark:text-slate-500"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="name@itpark.uz"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>

                <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-500">
                  <LockKeyhole
                    size={16}
                    className="shrink-0 text-slate-400 dark:text-slate-500"
                  />

                  <input
                    type="password"
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                {loading
                  ? 'Signing in...'
                  : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an
                account?{' '}
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/register',
                    )
                  }
                  className="font-medium text-slate-900 transition hover:text-slate-700 hover:underline dark:text-slate-100 dark:hover:text-white"
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}