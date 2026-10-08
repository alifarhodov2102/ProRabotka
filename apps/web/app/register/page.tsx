'use client';

import {
  FormEvent,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  BriefcaseBusiness,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';

import ThemeToggle from '@/components/theme-toggle';
import ProRabotkaLogo from '@/components/prorabotka-logo';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

const roles = [
  'Director',
  'Startup Manager',
  'Project Manager',
  'Infrastructure Manager',
  'Other',
];

export default function RegisterPage() {
  const router =
    useRouter();

  const [
    name,
    setName,
  ] = useState('');

  const [
    surname,
    setSurname,
  ] = useState('');

  const [
    role,
    setRole,
  ] = useState(
    'Startup Manager',
  );

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
    success,
    setSuccess,
  ] = useState(false);

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
          `${API_URL}/auth/register`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                name:
                  name.trim(),

                surname:
                  surname.trim(),

                role,

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
              'Registration failed';

        throw new Error(
          message,
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
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
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                ✓
              </div>

              <h1 className="mt-5 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Registration received
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your account is waiting
                for approval. You will be
                able to sign in once the
                administrator approves it.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/login',
                  )
                }
                className="mt-6 flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Back to sign in
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
              Internal system for IT Park Sirdaryo
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f7f8fa] px-6 dark:bg-slate-950">
      <div className="fixed right-5 top-5 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[700px] flex-col items-center justify-center py-10">
        <div className="mb-8 flex justify-center">
          <ProRabotkaLogo className="h-11 w-[205px]" />
        </div>

        <div className="w-full max-w-[460px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Create account
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Register for ProRabotka access
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Name"
                  icon={
                    <UserRound
                      size={16}
                    />
                  }
                >
                  <input
                    value={name}
                    onChange={(
                      event,
                    ) =>
                      setName(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Ali"
                    required
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </Field>

                <Field
                  label="Surname"
                  icon={
                    <UserRound
                      size={16}
                    />
                  }
                >
                  <input
                    value={
                      surname
                    }
                    onChange={(
                      event,
                    ) =>
                      setSurname(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Farhodov"
                    required
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </Field>
              </div>

              <Field
                label="Role"
                icon={
                  <BriefcaseBusiness
                    size={16}
                  />
                }
              >
                <select
                  value={role}
                  onChange={(
                    event,
                  ) =>
                    setRole(
                      event.target
                        .value,
                    )
                  }
                  className="w-full bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                >
                  {roles.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Email"
                icon={
                  <Mail
                    size={16}
                  />
                }
              >
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
                  placeholder="name@itpark.uz"
                  autoComplete="email"
                  required
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </Field>

              <Field
                label="Password"
                icon={
                  <LockKeyhole
                    size={16}
                  />
                }
              >
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
                  minLength={6}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </Field>

              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
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
                  ? 'Creating account...'
                  : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an
              account?{' '}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/login',
                  )
                }
                className="font-medium text-slate-900 transition hover:underline dark:text-slate-100 dark:hover:text-white"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-slate-500">
        <span className="text-slate-400 dark:text-slate-500">
          {icon}
        </span>

        {children}
      </div>
    </div>
  );
}