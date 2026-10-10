'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Banknote,
  Gift,
  Plus,
  Search,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import AppShell from '@/components/app-shell';

import SectionSpaces from '@/components/spaces/section-spaces';

import StartupCard from '@/components/startups/startup-card';

import StartupModal from '@/components/startups/startup-modal';

import {
  Startup,
} from '@/components/startups/types';

import {
  ApiError,
  apiFetch,
} from '@/lib/api';

type FundingFilter =
  | 'ALL'
  | 'INVESTMENT'
  | 'GRANT'
  | 'NO_FUNDING';

const emptyForm = {
  name: '',
  founderName: '',
  phone: '',
  email: '',
  stage: '',
  status: 'ACTIVE',
  joinedAt: '',
  notes: '',
};

export default function StartupsPage() {
  const [
    tab,
    setTab,
  ] = useState<
    'overview' | 'spaces'
  >('overview');

  const [
    startups,
    setStartups,
  ] =
    useState<Startup[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    fundingFilter,
    setFundingFilter,
  ] =
    useState<FundingFilter>(
      'ALL',
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState(
      emptyForm,
    );

  async function loadStartups() {
    try {
      setLoading(
        true,
      );

      setError('');

      const data =
        await apiFetch<
          Startup[]
        >(
          '/startups',
        );

      setStartups(
        data,
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status !==
          401
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setLoading(
        false,
      );
    }
  }

  useEffect(() => {
    void loadStartups();
  }, []);

  const counts =
    useMemo(() => {
      let investment =
        0;

      let grant = 0;

      let noFunding =
        0;

      for (
        const startup of
        startups
      ) {
        const hasInvestment =
          startup.funding.some(
            (item) =>
              item.type ===
              'INVESTMENT',
          );

        const hasGrant =
          startup.funding.some(
            (item) =>
              item.type ===
              'GRANT',
          );

        if (
          hasInvestment
        ) {
          investment +=
            1;
        }

        if (hasGrant) {
          grant += 1;
        }

        if (
          !hasInvestment &&
          !hasGrant
        ) {
          noFunding +=
            1;
        }
      }

      return {
        investment,
        grant,
        noFunding,
      };
    }, [startups]);

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return startups.filter(
        (startup) => {
          const hasInvestment =
            startup.funding.some(
              (item) =>
                item.type ===
                'INVESTMENT',
            );

          const hasGrant =
            startup.funding.some(
              (item) =>
                item.type ===
                'GRANT',
            );

          if (
            fundingFilter ===
              'INVESTMENT' &&
            !hasInvestment
          ) {
            return false;
          }

          if (
            fundingFilter ===
              'GRANT' &&
            !hasGrant
          ) {
            return false;
          }

          if (
            fundingFilter ===
              'NO_FUNDING' &&
            (hasInvestment ||
              hasGrant)
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            startup.name,
            startup.founderName,
            startup.email,
            startup.phone,
            startup.stage,
          ]
            .filter(
              Boolean,
            )
            .some(
              (
                value,
              ) =>
                String(
                  value,
                )
                  .toLowerCase()
                  .includes(
                    query,
                  ),
            );
        },
      );
    }, [
      startups,
      search,
      fundingFilter,
    ]);

  function openCreate() {
    setForm(
      emptyForm,
    );

    setModalOpen(
      true,
    );
  }

  async function saveStartup() {
    if (
      !form.name.trim()
    ) {
      return;
    }

    try {
      setSaving(
        true,
      );

      setError('');

      const payload = {
        ...form,

        name:
          form.name.trim(),

        founderName:
          form.founderName ||
          undefined,

        phone:
          form.phone ||
          undefined,

        email:
          form.email ||
          undefined,

        stage:
          form.stage ||
          undefined,

        joinedAt:
          form.joinedAt ||
          undefined,

        notes:
          form.notes ||
          undefined,
      };

      await apiFetch(
        '/startups',
        {
          method:
            'POST',

          body:
            JSON.stringify(
              payload,
            ),
        },
      );

      setModalOpen(
        false,
      );

      setForm(
        emptyForm,
      );

      await loadStartups();
    } catch (err) {
      if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message,
        );
      }
    } finally {
      setSaving(
        false,
      );
    }
  }

  return (
    <AppShell>
      <div className="min-w-0 space-y-6 lg:space-y-7">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Workspace
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Startups
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage startup
              profiles, funding
              and documents.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openCreate
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.99] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white sm:h-10 sm:w-auto sm:rounded-lg"
          >
            <Plus
              size={
                16
              }
            />

            Add startup
          </button>
        </section>

        <section className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() =>
                setTab(
                  'overview',
                )
              }
              className={[
                'border-b-2 px-1 pb-3 text-sm transition',

                tab ===
                'overview'
                  ? 'border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
              ].join(
                ' ',
              )}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() =>
                setTab(
                  'spaces',
                )
              }
              className={[
                'border-b-2 px-1 pb-3 text-sm transition',

                tab ===
                'spaces'
                  ? 'border-slate-900 font-medium text-slate-900 dark:border-slate-100 dark:text-slate-100'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300',
              ].join(
                ' ',
              )}
            >
              Spaces
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {tab ===
          'spaces' ? (
          <SectionSpaces section="STARTUPS" />
        ) : loading ? (
          <div className="py-24 text-center text-sm text-slate-400 dark:text-slate-500">
            Loading
            startups...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <SummaryCard
                label="Total"
                value={
                  startups.length
                }
                icon={
                  <Sparkles
                    size={
                      17
                    }
                  />
                }
              />

              <SummaryCard
                label="Investment"
                value={
                  counts.investment
                }
                icon={
                  <Banknote
                    size={
                      17
                    }
                  />
                }
              />

              <SummaryCard
                label="Grant"
                value={
                  counts.grant
                }
                icon={
                  <Gift
                    size={
                      17
                    }
                  />
                }
              />

              <SummaryCard
                label="No funding"
                value={
                  counts.noFunding
                }
                icon={
                  <WalletCards
                    size={
                      17
                    }
                  />
                }
              />
            </section>

            <section className="space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 sm:max-w-sm">
                  <Search
                    size={
                      16
                    }
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event,
                    ) =>
                      setSearch(
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Search startups..."
                    className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-sm"
                  />
                </div>

                <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                  <FilterButton
                    active={
                      fundingFilter ===
                      'ALL'
                    }
                    onClick={() =>
                      setFundingFilter(
                        'ALL',
                      )
                    }
                  >
                    All
                  </FilterButton>

                  <FilterButton
                    active={
                      fundingFilter ===
                      'INVESTMENT'
                    }
                    onClick={() =>
                      setFundingFilter(
                        'INVESTMENT',
                      )
                    }
                  >
                    Investment
                  </FilterButton>

                  <FilterButton
                    active={
                      fundingFilter ===
                      'GRANT'
                    }
                    onClick={() =>
                      setFundingFilter(
                        'GRANT',
                      )
                    }
                  >
                    Grant
                  </FilterButton>

                  <FilterButton
                    active={
                      fundingFilter ===
                      'NO_FUNDING'
                    }
                    onClick={() =>
                      setFundingFilter(
                        'NO_FUNDING',
                      )
                    }
                  >
                    No funding
                  </FilterButton>
                </div>
              </div>

              {filtered.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    No startups
                    found
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Change the
                    search or
                    funding filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {filtered.map(
                    (
                      startup,
                    ) => (
                      <StartupCard
                        key={
                          startup.id
                        }
                        startup={
                          startup
                        }
                      />
                    ),
                  )}
                </div>
              )}
            </section>
          </>
        )}

        <StartupModal
          open={
            modalOpen
          }
          title="Add startup"
          value={
            form
          }
          saving={
            saving
          }
          onChange={
            setForm
          }
          onClose={() => {
            if (
              !saving
            ) {
              setModalOpen(
                false,
              );
            }
          }}
          onSave={
            saveStartup
          }
        />
      </div>
    </AppShell>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;

  onClick:
    () => void;

  children:
    React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        'shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm',

        active
          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
      ].join(' ')}
    >
      {
        children
      }
    </button>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:h-9 sm:w-9">
          {icon}
        </div>
      </div>
    </div>
  );
}